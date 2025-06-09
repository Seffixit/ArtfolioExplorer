# Deployment Guide

## GitHub Setup

### Option 1: Using Replit's GitHub Integration

1. **Connect to GitHub:**
   - Click the "Version Control" tab in Replit sidebar
   - Click "Connect to GitHub"
   - Authorize Replit to access your GitHub account

2. **Create Repository:**
   - Click "Create GitHub Repo"
   - Choose repository name (e.g., "securevault-file-storage")
   - Set visibility (Public or Private)
   - Click "Create Repository"

3. **Push to GitHub:**
   - All changes will automatically sync to GitHub
   - You can also manually push using the "Push to GitHub" button

### Option 2: Manual GitHub Setup

1. **Create GitHub Repository:**
   - Go to github.com and create a new repository
   - Name it "securevault-file-storage" or your preferred name
   - Don't initialize with README (we already have one)

2. **Connect from Replit Shell:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git add .
   git commit -m "Initial commit: SecureVault file storage system"
   git push -u origin main
   ```

## Environment Variables for Production

When deploying, ensure these environment variables are set:

```bash
# Database
DATABASE_URL=your_production_postgresql_url

# Authentication
SESSION_SECRET=your_secure_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your-production-domain.com

# Optional
NODE_ENV=production
```

## Deployment Options

### 1. Replit Deployments (Recommended)

1. Click "Deploy" in Replit
2. Choose "Autoscale Deployment"
3. Configure domain and resources
4. Deploy automatically

### 2. External Hosting

For other platforms (Vercel, Railway, Render, etc.):

1. **Environment Setup:**
   - Set all required environment variables
   - Ensure PostgreSQL database is accessible

2. **Build Commands:**
   ```bash
   npm install
   npm run build
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

## Database Migration

For production deployment:

1. **Set up PostgreSQL database**
2. **Run schema creation:**
   ```bash
   npm run db:push
   ```

## Security Checklist

- [ ] Strong SESSION_SECRET set
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] Environment variables protected
- [ ] Authentication configured
- [ ] File upload limits set
- [ ] CORS configured properly

## Post-Deployment

1. **Test authentication flow**
2. **Create test buckets**
3. **Verify file uploads**
4. **Check permissions system**
5. **Review audit logs**

## Support

For deployment issues:
- Check environment variables
- Verify database connectivity
- Review application logs
- Test authentication endpoints