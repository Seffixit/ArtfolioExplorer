import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBucketSchema, insertFileSchema, insertBucketPermissionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import crypto from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Bucket routes
  app.get('/api/buckets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const buckets = await storage.getBuckets(userId);
      res.json(buckets);
    } catch (error) {
      console.error("Error fetching buckets:", error);
      res.status(500).json({ message: "Failed to fetch buckets" });
    }
  });

  app.get('/api/buckets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bucketId = parseInt(req.params.id);
      
      // Check permissions
      const permission = await storage.checkUserPermission(userId, bucketId);
      if (!permission) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bucket = await storage.getBucketById(bucketId);
      if (!bucket) {
        return res.status(404).json({ message: "Bucket not found" });
      }

      // Log access
      await storage.logAccess({
        userId,
        bucketId,
        action: 'view',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(bucket);
    } catch (error) {
      console.error("Error fetching bucket:", error);
      res.status(500).json({ message: "Failed to fetch bucket" });
    }
  });

  app.post('/api/buckets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bucketData = insertBucketSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const bucket = await storage.createBucket(bucketData);
      res.status(201).json(bucket);
    } catch (error) {
      console.error("Error creating bucket:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bucket data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bucket" });
      }
    }
  });

  app.put('/api/buckets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bucketId = parseInt(req.params.id);
      
      // Check admin permissions
      const permission = await storage.checkUserPermission(userId, bucketId);
      if (permission !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updates = insertBucketSchema.partial().parse(req.body);
      const bucket = await storage.updateBucket(bucketId, updates);
      res.json(bucket);
    } catch (error) {
      console.error("Error updating bucket:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bucket data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update bucket" });
      }
    }
  });

  app.delete('/api/buckets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bucketId = parseInt(req.params.id);
      
      // Check admin permissions
      const permission = await storage.checkUserPermission(userId, bucketId);
      if (permission !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteBucket(bucketId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bucket:", error);
      res.status(500).json({ message: "Failed to delete bucket" });
    }
  });

  // File routes
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bucketId, search } = req.query;
      
      if (bucketId) {
        const permission = await storage.checkUserPermission(userId, parseInt(bucketId as string));
        if (!permission) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const files = await storage.getFiles(
        bucketId ? parseInt(bucketId as string) : undefined,
        search as string
      );
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileId = parseInt(req.params.id);
      
      const file = await storage.getFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check permissions
      const permission = await storage.checkUserPermission(userId, file.bucketId);
      if (!permission) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Log access
      await storage.logAccess({
        userId,
        fileId,
        bucketId: file.bucketId,
        action: 'view',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post('/api/files/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bucketId, path = '/', description, tags } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Check write permissions
      const permission = await storage.checkUserPermission(userId, parseInt(bucketId));
      if (!permission || (permission !== 'write' && permission !== 'admin')) {
        return res.status(403).json({ message: "Write access required" });
      }

      // Generate unique filename and checksum
      const fileExtension = req.file.originalname.split('.').pop();
      const uniqueName = `${crypto.randomUUID()}.${fileExtension}`;
      const checksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

      const fileData = insertFileSchema.parse({
        name: uniqueName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        bucketId: parseInt(bucketId),
        uploaderId: userId,
        path: path || '/',
        description,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        checksum,
      });

      const file = await storage.createFile(fileData);

      // Log upload
      await storage.logAccess({
        userId,
        fileId: file.id,
        bucketId: file.bucketId,
        action: 'upload',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid file data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  });

  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileId = parseInt(req.params.id);
      
      const file = await storage.getFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check write permissions
      const permission = await storage.checkUserPermission(userId, file.bucketId);
      if (!permission || (permission !== 'write' && permission !== 'admin')) {
        return res.status(403).json({ message: "Write access required" });
      }

      await storage.deleteFile(fileId);

      // Log deletion
      await storage.logAccess({
        userId,
        fileId,
        bucketId: file.bucketId,
        action: 'delete',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Permission routes
  app.get('/api/buckets/:id/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bucketId = parseInt(req.params.id);
      
      // Check admin permissions
      const permission = await storage.checkUserPermission(userId, bucketId);
      if (permission !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const permissions = await storage.getBucketPermissions(bucketId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.post('/api/buckets/:id/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bucketId = parseInt(req.params.id);
      
      // Check admin permissions
      const permission = await storage.checkUserPermission(userId, bucketId);
      if (permission !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const permissionData = insertBucketPermissionSchema.parse({
        ...req.body,
        bucketId,
        grantedBy: userId,
      });
      
      const newPermission = await storage.createBucketPermission(permissionData);
      res.status(201).json(newPermission);
    } catch (error) {
      console.error("Error creating permission:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid permission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create permission" });
      }
    }
  });

  app.delete('/api/permissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const permissionId = parseInt(req.params.id);
      
      // Get permission details to check bucket access
      const permissions = await storage.getBucketPermissions(0); // This needs to be fixed
      const targetPermission = permissions.find(p => p.id === permissionId);
      
      if (!targetPermission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      // Check admin permissions on the bucket
      const permission = await storage.checkUserPermission(userId, targetPermission.bucketId);
      if (permission !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteBucketPermission(permissionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting permission:", error);
      res.status(500).json({ message: "Failed to delete permission" });
    }
  });

  // Access log routes
  app.get('/api/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bucketId, fileId } = req.query;
      
      if (bucketId) {
        const permission = await storage.checkUserPermission(userId, parseInt(bucketId as string));
        if (permission !== 'admin') {
          return res.status(403).json({ message: "Admin access required" });
        }
      }

      const logs = await storage.getAccessLogs(
        bucketId ? parseInt(bucketId as string) : undefined,
        fileId ? parseInt(fileId as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
