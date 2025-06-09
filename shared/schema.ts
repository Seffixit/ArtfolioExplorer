import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File storage buckets
export const buckets = pgTable("buckets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(false),
  maxSize: integer("max_size").default(1073741824), // 1GB default
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Files stored in buckets
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  bucketId: integer("bucket_id").notNull().references(() => buckets.id),
  uploaderId: varchar("uploader_id").notNull().references(() => users.id),
  path: varchar("path", { length: 500 }).notNull(), // Virtual path for organization
  tags: text("tags").array(),
  description: text("description"),
  checksum: varchar("checksum", { length: 64 }), // For integrity verification
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Access permissions for buckets
export const bucketPermissions = pgTable("bucket_permissions", {
  id: serial("id").primaryKey(),
  bucketId: integer("bucket_id").notNull().references(() => buckets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  permission: varchar("permission", { length: 20 }).notNull(), // 'read', 'write', 'admin'
  grantedBy: varchar("granted_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Access logs for audit trail
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileId: integer("file_id").references(() => files.id),
  bucketId: integer("bucket_id").references(() => buckets.id),
  action: varchar("action", { length: 50 }).notNull(), // 'view', 'download', 'upload', 'delete'
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedBuckets: many(buckets),
  uploadedFiles: many(files),
  bucketPermissions: many(bucketPermissions),
  accessLogs: many(accessLogs),
}));

export const bucketsRelations = relations(buckets, ({ one, many }) => ({
  owner: one(users, {
    fields: [buckets.ownerId],
    references: [users.id],
  }),
  files: many(files),
  permissions: many(bucketPermissions),
  accessLogs: many(accessLogs),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  bucket: one(buckets, {
    fields: [files.bucketId],
    references: [buckets.id],
  }),
  uploader: one(users, {
    fields: [files.uploaderId],
    references: [users.id],
  }),
  accessLogs: many(accessLogs),
}));

export const bucketPermissionsRelations = relations(bucketPermissions, ({ one }) => ({
  bucket: one(buckets, {
    fields: [bucketPermissions.bucketId],
    references: [buckets.id],
  }),
  user: one(users, {
    fields: [bucketPermissions.userId],
    references: [users.id],
  }),
  grantedByUser: one(users, {
    fields: [bucketPermissions.grantedBy],
    references: [users.id],
  }),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
  file: one(files, {
    fields: [accessLogs.fileId],
    references: [files.id],
  }),
  bucket: one(buckets, {
    fields: [accessLogs.bucketId],
    references: [buckets.id],
  }),
}));

// Insert schemas
export const insertBucketSchema = createInsertSchema(buckets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBucketPermissionSchema = createInsertSchema(bucketPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Bucket = typeof buckets.$inferSelect;
export type InsertBucket = z.infer<typeof insertBucketSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type BucketPermission = typeof bucketPermissions.$inferSelect;
export type InsertBucketPermission = z.infer<typeof insertBucketPermissionSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;

// Extended types with relations
export type BucketWithDetails = Bucket & {
  owner: User;
  files: File[];
  permissions: BucketPermission[];
};

export type FileWithDetails = File & {
  bucket: Bucket;
  uploader: User;
};
