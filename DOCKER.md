# Docker Setup Guide

This guide explains how to run the ScrollTrigger 3D Website Template using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Development Mode

For development with hot reloading:

```bash
# Start development container
docker-compose --profile dev up --build

# Or using Docker directly
docker build -f Dockerfile.dev -t scrolltrigger-dev .
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules scrolltrigger-dev
```

The application will be available at `http://localhost:3000` with hot reloading enabled.

### Production Mode

For production deployment:

```bash
# Build and start production container
docker-compose --profile prod up --build

# Or using Docker directly
docker build -t scrolltrigger-prod .
docker run -p 3000:3000 scrolltrigger-prod
```

### Production with Nginx

For production with Nginx reverse proxy:

```bash
# Start with Nginx proxy
docker-compose --profile prod-nginx up --build
```

This will make the application available at `http://localhost` (port 80).

## Docker Commands

### Building Images

```bash
# Build development image
docker build -f Dockerfile.dev -t scrolltrigger:dev .

# Build production image  
docker build -t scrolltrigger:prod .
```

### Running Containers

```bash
# Development
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules scrolltrigger:dev

# Production
docker run -p 3000:3000 scrolltrigger:prod
```

### Managing Containers

```bash
# Stop all services
docker-compose down

# Remove containers and images
docker-compose down --rmi all

# View logs
docker-compose logs -f

# Rebuild without cache
docker-compose build --no-cache
```

## Environment Variables

Create a `.env.local` file for environment-specific variables:

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the port mapping:
```bash
docker run -p 3001:3000 scrolltrigger:dev
```

### Permission Issues (Linux/macOS)
If you encounter permission issues with volumes:
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

### Build Failures
If build fails due to memory constraints:
```bash
# Increase Docker memory allocation or use smaller base image
docker build --memory=4g -t scrolltrigger:prod .
```

## File Structure

```
├── Dockerfile              # Multi-stage production build
├── Dockerfile.dev          # Development with hot reload
├── docker-compose.yml      # Multi-environment setup
├── .dockerignore           # Files to exclude from build
├── nginx.conf              # Nginx configuration
└── DOCKER.md              # This guide
```

## Performance Tips

1. **Layer Caching**: The Dockerfile is optimized for layer caching
2. **Multi-stage Build**: Production image only includes necessary files
3. **Standalone Output**: Next.js standalone mode reduces image size
4. **Nginx Proxy**: Optional reverse proxy for production scaling

## Security Considerations

- Non-root user in production container
- Minimal base image (Alpine Linux)
- No unnecessary packages
- Environment-specific configurations
