import {
  users,
  buckets,
  files,
  bucketPermissions,
  accessLogs,
  type User,
  type UpsertUser,
  type Bucket,
  type InsertBucket,
  type File,
  type InsertFile,
  type BucketPermission,
  type InsertBucketPermission,
  type AccessLog,
  type InsertAccessLog,
  type BucketWithDetails,
  type FileWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, or, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Bucket operations
  getBuckets(userId?: string): Promise<BucketWithDetails[]>;
  getBucketById(id: number): Promise<BucketWithDetails | undefined>;
  createBucket(bucket: InsertBucket): Promise<Bucket>;
  updateBucket(id: number, updates: Partial<InsertBucket>): Promise<Bucket>;
  deleteBucket(id: number): Promise<void>;
  
  // File operations
  getFiles(bucketId?: number, search?: string): Promise<FileWithDetails[]>;
  getFileById(id: number): Promise<FileWithDetails | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File>;
  deleteFile(id: number): Promise<void>;
  
  // Permission operations
  getBucketPermissions(bucketId: number): Promise<BucketPermission[]>;
  createBucketPermission(permission: InsertBucketPermission): Promise<BucketPermission>;
  deleteBucketPermission(id: number): Promise<void>;
  checkUserPermission(userId: string, bucketId: number): Promise<string | null>; // returns permission level or null
  
  // Access log operations
  logAccess(accessLog: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(bucketId?: number, fileId?: number): Promise<AccessLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Bucket operations
  async getBuckets(userId?: string): Promise<BucketWithDetails[]> {
    let query = db
      .select()
      .from(buckets)
      .leftJoin(users, eq(buckets.ownerId, users.id))
      .leftJoin(files, eq(buckets.id, files.bucketId))
      .leftJoin(bucketPermissions, eq(buckets.id, bucketPermissions.bucketId));

    if (userId) {
      query = query.where(
        or(
          eq(buckets.ownerId, userId),
          eq(bucketPermissions.userId, userId),
          eq(buckets.isPublic, true)
        )
      );
    }

    const results = await query.orderBy(desc(buckets.createdAt));

    // Group results by bucket
    const bucketMap = new Map<number, BucketWithDetails>();

    for (const row of results) {
      const bucketId = row.buckets!.id;
      
      if (!bucketMap.has(bucketId)) {
        bucketMap.set(bucketId, {
          ...row.buckets!,
          owner: row.users!,
          files: row.files ? [row.files] : [],
          permissions: row.bucket_permissions ? [row.bucket_permissions] : [],
        });
      } else {
        const bucket = bucketMap.get(bucketId)!;
        if (row.files && !bucket.files.find(f => f.id === row.files!.id)) {
          bucket.files.push(row.files);
        }
        if (row.bucket_permissions && !bucket.permissions.find(p => p.id === row.bucket_permissions!.id)) {
          bucket.permissions.push(row.bucket_permissions);
        }
      }
    }

    return Array.from(bucketMap.values());
  }

  async getBucketById(id: number): Promise<BucketWithDetails | undefined> {
    const results = await db
      .select()
      .from(buckets)
      .leftJoin(users, eq(buckets.ownerId, users.id))
      .leftJoin(files, eq(buckets.id, files.bucketId))
      .leftJoin(bucketPermissions, eq(buckets.id, bucketPermissions.bucketId))
      .where(eq(buckets.id, id));

    if (results.length === 0) {
      return undefined;
    }

    const firstRow = results[0];
    return {
      ...firstRow.buckets!,
      owner: firstRow.users!,
      files: results.filter(row => row.files).map(row => row.files!),
      permissions: results.filter(row => row.bucket_permissions).map(row => row.bucket_permissions!),
    };
  }

  async createBucket(bucketData: InsertBucket): Promise<Bucket> {
    const [bucket] = await db
      .insert(buckets)
      .values(bucketData)
      .returning();
    return bucket;
  }

  async updateBucket(id: number, updates: Partial<InsertBucket>): Promise<Bucket> {
    const [bucket] = await db
      .update(buckets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(buckets.id, id))
      .returning();
    return bucket;
  }

  async deleteBucket(id: number): Promise<void> {
    await db.delete(buckets).where(eq(buckets.id, id));
  }

  // File operations
  async getFiles(bucketId?: number, search?: string): Promise<FileWithDetails[]> {
    let query = db
      .select()
      .from(files)
      .leftJoin(buckets, eq(files.bucketId, buckets.id))
      .leftJoin(users, eq(files.uploaderId, users.id));

    const conditions = [];

    if (bucketId) {
      conditions.push(eq(files.bucketId, bucketId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(files.name, `%${search}%`),
          ilike(files.originalName, `%${search}%`),
          ilike(files.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(files.createdAt));

    return results.map(row => ({
      ...row.files!,
      bucket: row.buckets!,
      uploader: row.users!,
    }));
  }

  async getFileById(id: number): Promise<FileWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(files)
      .leftJoin(buckets, eq(files.bucketId, buckets.id))
      .leftJoin(users, eq(files.uploaderId, users.id))
      .where(eq(files.id, id));

    if (!result) {
      return undefined;
    }

    return {
      ...result.files!,
      bucket: result.buckets!,
      uploader: result.users!,
    };
  }

  async createFile(fileData: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(fileData)
      .returning();
    return file;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File> {
    const [file] = await db
      .update(files)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // Permission operations
  async getBucketPermissions(bucketId: number): Promise<BucketPermission[]> {
    return await db
      .select()
      .from(bucketPermissions)
      .where(eq(bucketPermissions.bucketId, bucketId));
  }

  async createBucketPermission(permissionData: InsertBucketPermission): Promise<BucketPermission> {
    const [permission] = await db
      .insert(bucketPermissions)
      .values(permissionData)
      .returning();
    return permission;
  }

  async deleteBucketPermission(id: number): Promise<void> {
    await db.delete(bucketPermissions).where(eq(bucketPermissions.id, id));
  }

  async checkUserPermission(userId: string, bucketId: number): Promise<string | null> {
    // Check if user is owner
    const [bucket] = await db
      .select({ ownerId: buckets.ownerId })
      .from(buckets)
      .where(eq(buckets.id, bucketId));
    
    if (bucket?.ownerId === userId) {
      return 'admin';
    }

    // Check explicit permissions
    const [permission] = await db
      .select({ permission: bucketPermissions.permission })
      .from(bucketPermissions)
      .where(
        and(
          eq(bucketPermissions.bucketId, bucketId),
          eq(bucketPermissions.userId, userId)
        )
      );

    return permission?.permission || null;
  }

  // Access log operations
  async logAccess(accessLogData: InsertAccessLog): Promise<AccessLog> {
    const [log] = await db
      .insert(accessLogs)
      .values(accessLogData)
      .returning();
    return log;
  }

  async getAccessLogs(bucketId?: number, fileId?: number): Promise<AccessLog[]> {
    let query = db.select().from(accessLogs);

    const conditions = [];

    if (bucketId) {
      conditions.push(eq(accessLogs.bucketId, bucketId));
    }

    if (fileId) {
      conditions.push(eq(accessLogs.fileId, fileId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(accessLogs.timestamp));
  }
}

export const storage = new DatabaseStorage();
