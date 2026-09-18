#!/bin/bash

# ============================================
# AgriMarket Production Deployment Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/agrimarket"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/logs/deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Main deployment process
main() {
    log "Starting deployment..."

    # 1. Pre-deployment checks
    log "Running pre-deployment checks..."
    
    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        error "Production environment file not found!"
    fi

    # 2. Create backup
    log "Creating database backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
    
    docker-compose -f docker-compose.prod.yml exec -T postgres \
        pg_dump -U agrimarket agrimarket_prod | gzip > "$BACKUP_FILE.gz"
    
    log "Backup created: $BACKUP_FILE.gz"

    # 3. Pull latest code
    log "Pulling latest code from repository..."
    git fetch origin
    git checkout main
    git pull origin main

    # 4. Build new images
    log "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache api

    # 5. Stop old containers (graceful)
    log "Stopping old containers..."
    docker-compose -f docker-compose.prod.yml stop api

    # 6. Run database migrations
    log "Running database migrations..."
    docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

    # 7. Start new containers
    log "Starting new containers..."
    docker-compose -f docker-compose.prod.yml up -d --no-deps api

    # 8. Wait for health check
    log "Waiting for application to be healthy..."
    sleep 10
    
    for i in {1..30}; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log "Application is healthy!"
            break
        fi
        
        if [ $i -eq 30 ]; then
            error "Application failed to start!"
        fi
        
        sleep 2
    done

    # 9. Clean up old images
    log "Cleaning up old Docker images..."
    docker image prune -f

    # 10. Verify deployment
    log "Verifying deployment..."
    RESPONSE=$(curl -s http://localhost:3001/health)
    
    if echo "$RESPONSE" | grep -q '"status":"healthy"'; then
        log "✅ Deployment successful!"
    else
        warn "⚠️  Deployment completed but health check returned unexpected response"
    fi

    # 11. Send notification (optional)
    # send_notification "Deployment completed successfully"

    log "Deployment completed at $(date)"
}

# Rollback function
rollback() {
    warn "Rolling back to previous version..."
    
    # Stop current version
    docker-compose -f docker-compose.prod.yml stop api
    
    # Start previous version
    docker-compose -f docker-compose.prod.yml up -d --no-deps api
    
    # Restore database if needed
    if [ ! -z "$1" ]; then
        log "Restoring database from backup: $1"
        gunzip < "$1" | docker-compose -f docker-compose.prod.yml exec -T postgres \
            psql -U agrimarket agrimarket_prod
    fi
    
    log "Rollback completed"
}

# Run deployment
cd "$PROJECT_DIR" || error "Project directory not found!"
main

exit 0
