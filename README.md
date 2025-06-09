# SecureVault - Business File Storage System

A secure business file storage system with credential-based access control, built with React, Express, and PostgreSQL.

## Features

- **Enterprise Security**: Bank-level encryption and secure authentication
- **Bucket-Based Organization**: Organize files in secure storage buckets
- **Granular Permissions**: Role-based access controls (read, write, admin)
- **Complete Audit Trail**: Track all file access and modifications
- **Dark Mode**: Professional interface with dark mode support
- **File Upload**: Secure file upload with metadata and tagging
- **Real-time Search**: Search files across buckets

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **File Storage**: Secure file handling with checksums
- **Deployment**: Replit Deployments

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd securevault
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your-domain.replit.app
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Database Schema

- **users**: User accounts with Replit Auth integration
- **buckets**: Storage containers with ownership and privacy settings
- **files**: File metadata with upload tracking and checksums
- **bucket_permissions**: Granular access control system
- **access_logs**: Comprehensive audit trail
- **sessions**: Secure session management

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

### Buckets
- `GET /api/buckets` - List user's buckets
- `POST /api/buckets` - Create new bucket
- `GET /api/buckets/:id` - Get bucket details
- `PUT /api/buckets/:id` - Update bucket
- `DELETE /api/buckets/:id` - Delete bucket

### Files
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete file

### Permissions
- `GET /api/buckets/:id/permissions` - List bucket permissions
- `POST /api/buckets/:id/permissions` - Grant permission
- `DELETE /api/permissions/:id` - Revoke permission

### Audit Logs
- `GET /api/logs` - Get access logs

## Security Features

- **Authentication**: Secure OpenID Connect integration
- **Authorization**: Role-based access control
- **File Integrity**: SHA-256 checksums for all uploads
- **Audit Logging**: Complete activity tracking
- **Session Security**: Secure session management with PostgreSQL storage
- **Input Validation**: Comprehensive request validation with Zod

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact your system administrator or create an issue in the repository.