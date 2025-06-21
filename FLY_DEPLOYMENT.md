# Fly.io Deployment Guide

This guide will help you deploy your Next.js notes app to Fly.io with PostgreSQL database.

## Prerequisites

1. **Fly CLI**: Install the Fly.io CLI
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Fly.io Account**: Sign up at [fly.io](https://fly.io) and get your API token

3. **Login to Fly.io**:
   ```bash
   fly auth login
   ```

## Environment Variables

Before deploying, you'll need to set up your environment variables. Create a `.env` file locally for development:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth (if using authentication)
NEXTAUTH_URL="https://your-app-name.fly.dev"
NEXTAUTH_SECRET="your-secret-key"

# Other environment variables your app needs
```

## Quick Deployment

1. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

   This script will:
   - Check if Fly CLI is installed and you're logged in
   - Create a PostgreSQL database
   - Attach the database to your app
   - Create a persistent volume
   - Deploy your application

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Create the App
```bash
fly apps create jjnotes
```

### 2. Create PostgreSQL Database
```bash
fly postgres create --name jjnotes-db --region iad --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1
```

### 3. Attach Database to App
```bash
fly postgres attach --postgres-app jjnotes-db --app jjnotes
```

### 4. Create Persistent Volume
```bash
fly volumes create jjnotes_data --size 1 --region iad
```

### 5. Set Environment Variables
```bash
fly secrets set NEXTAUTH_SECRET="your-secret-key"
fly secrets set NEXTAUTH_URL="https://jjnotes.fly.dev"
# Add other secrets as needed
```

### 6. Deploy
```bash
fly deploy
```

## Configuration Files

### fly.toml
- Configures the app for Fly.io
- Sets up health checks
- Defines VM resources (1 CPU, 1GB RAM)
- Configures auto-scaling

### Dockerfile
- Multi-stage build for optimal image size
- Includes Prisma client generation
- Uses Next.js standalone output
- Runs as non-root user for security

### next.config.js
- Enables standalone output for Docker deployment
- Maintains existing webpack configuration

## Database Management

### Connect to Database
```bash
fly postgres connect -a jjnotes-db
```

### Run Prisma Migrations
```bash
fly ssh console -a jjnotes
npx prisma migrate deploy
```

### View Database Logs
```bash
fly logs -a jjnotes-db
```

## Monitoring and Maintenance

### View App Logs
```bash
fly logs -a jjnotes
```

### Check App Status
```bash
fly status -a jjnotes
```

### SSH into App
```bash
fly ssh console -a jjnotes
```

### Scale App
```bash
# Scale to 2 instances
fly scale count 2 -a jjnotes

# Scale VM size
fly scale vm shared-cpu-2x -a jjnotes
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in `package.json`
2. **Database Connection**: Ensure `DATABASE_URL` is set correctly
3. **Health Check Failures**: Verify the `/api/health` endpoint works
4. **Memory Issues**: Consider scaling up VM size if needed

### Useful Commands

```bash
# View recent logs
fly logs -a jjnotes --tail

# Restart the app
fly apps restart jjnotes

# Destroy and recreate (nuclear option)
fly apps destroy jjnotes
fly apps create jjnotes
```

## Cost Optimization

- The app is configured with auto-scaling (min 0, max based on demand)
- Uses shared CPU instances for cost efficiency
- PostgreSQL uses shared-cpu-1x with 1GB storage

## Security

- App runs as non-root user
- HTTPS is enforced
- Environment variables are stored as secrets
- Database is isolated and secured

## Support

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Community](https://community.fly.io/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment) 