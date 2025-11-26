# Deployment Guide: Social Integrations

Complete guide for deploying WhatsApp, Facebook, and Instagram integrations to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Security audit completed
- [ ] Performance optimized
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Monitoring set up

## Frontend Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables
vercel env add NEXT_PUBLIC_SERVER_URL
# Enter: https://your-api.com

# 4. Redeploy with env vars
vercel --prod
```

### Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Connect repository
netlify init

# 3. Set environment variables
netlify env:set NEXT_PUBLIC_SERVER_URL https://your-api.com

# 4. Deploy
netlify deploy --prod
```

### Self-Hosted (AWS, DigitalOcean, etc.)

```bash
# 1. Build
npm run build

# 2. Upload to server
scp -r .next/ user@server:/var/www/app/

# 3. Install dependencies
ssh user@server "cd /var/www/app && npm install --production"

# 4. Start with PM2
ssh user@server "pm2 start 'npm start' --name 'app'"
```

## Backend Deployment

### Heroku

```bash
# 1. Install Heroku CLI
npm i -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Set environment variables
heroku config:set PORT=3001
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.com
heroku config:set WPP_HEADLESS=true

# 5. Deploy
git push heroku main

# 6. View logs
heroku logs --tail
```

### Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Deploy
railway up

# 5. Set environment variables
railway variables set PORT=3001
railway variables set NODE_ENV=production
```

### AWS EC2

```bash
# 1. SSH into instance
ssh -i key.pem ec2-user@your-instance.com

# 2. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# 3. Install Chrome
sudo yum install -y chromium

# 4. Clone repository
git clone https://github.com/your-repo.git
cd your-repo/server

# 5. Install dependencies
npm install --production

# 6. Create .env file
cp .env.example .env
# Edit .env with production values

# 7. Install PM2
npm i -g pm2

# 8. Start application
pm2 start index.js --name "social-integrations"
pm2 startup
pm2 save

# 9. Setup Nginx reverse proxy
sudo yum install -y nginx
# Configure /etc/nginx/nginx.conf
sudo systemctl start nginx
```

### Docker

```bash
# 1. Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:16-alpine

# Install Chrome
RUN apk add --no-cache chromium

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
EOF

# 2. Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.git
EOF

# 3. Build image
docker build -t social-integrations-server .

# 4. Run container
docker run -p 3001:3001 \
  -e PORT=3001 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=https://your-frontend.com \
  social-integrations-server

# 5. Push to Docker Hub
docker tag social-integrations-server your-username/social-integrations-server
docker push your-username/social-integrations-server
```

### Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: social-integrations-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: social-integrations-server
  template:
    metadata:
      labels:
        app: social-integrations-server
    spec:
      containers:
      - name: server
        image: your-username/social-integrations-server:latest
        ports:
        - containerPort: 3001
        env:
        - name: PORT
          value: "3001"
        - name: NODE_ENV
          value: "production"
        - name: FRONTEND_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: frontend-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: social-integrations-service
spec:
  selector:
    app: social-integrations-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

## Environment Configuration

### Production .env

```env
# Server
PORT=3001
NODE_ENV=production

# Frontend
FRONTEND_URL=https://your-frontend.com

# WhatsApp
WPP_SESSION_NAME=production-session
WPP_HEADLESS=true
WPP_DEVTOOLS=false
WPP_USE_CHROME=true
WHATSAPP_SESSION_TIMEOUT=3600000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/social-integrations/server.log

# Session Storage
SESSION_STORAGE_PATH=/var/lib/social-integrations/sessions
```

## SSL/TLS Configuration

### Nginx with Let's Encrypt

```bash
# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot certonly --nginx -d your-domain.com

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Setup

### PostgreSQL

```bash
# 1. Create database
createdb social_integrations

# 2. Create tables
psql social_integrations < schema.sql

# 3. Create backups
pg_dump social_integrations > backup.sql
```

### MongoDB

```bash
# 1. Create database
mongo
> use social_integrations

# 2. Create collections
> db.createCollection("sessions")
> db.createCollection("messages")

# 3. Create indexes
> db.sessions.createIndex({ "userId": 1 })
> db.messages.createIndex({ "sessionId": 1, "createdAt": -1 })
```

## Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 Plus
pm2 install pm2-auto-pull

# Monitor
pm2 monit

# View logs
pm2 logs social-integrations
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# 1. Install Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.14.0-linux-x86_64.tar.gz

# 2. Configure
nano filebeat.yml

# 3. Start
./filebeat -e
```

### CloudWatch (AWS)

```bash
# 1. Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# 2. Configure
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# 3. Start
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s
```

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/social-integrations"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump social_integrations > $BACKUP_DIR/db_$DATE.sql

# Backup sessions
tar -czf $BACKUP_DIR/sessions_$DATE.tar.gz /var/lib/social-integrations/sessions

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql s3://your-bucket/backups/
aws s3 cp $BACKUP_DIR/sessions_$DATE.tar.gz s3://your-bucket/backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Cron Job

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

## Performance Optimization

### Caching

```bash
# Install Redis
sudo apt-get install redis-server

# Configure
sudo nano /etc/redis/redis.conf

# Start
sudo systemctl start redis-server
```

### CDN Setup

```bash
# CloudFlare
1. Add domain to CloudFlare
2. Update nameservers
3. Enable caching rules
4. Setup page rules
```

## Security Hardening

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp  # Only from frontend server
```

### Rate Limiting

```bash
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3001;
}
```

### CORS Configuration

```javascript
// server/index.js
const cors = require('cors')

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## Monitoring Checklist

- [ ] Server uptime monitoring
- [ ] Error rate monitoring
- [ ] Response time monitoring
- [ ] Database performance
- [ ] Memory usage
- [ ] CPU usage
- [ ] Disk space
- [ ] Network bandwidth
- [ ] SSL certificate expiration
- [ ] Backup verification

## Rollback Procedure

```bash
# 1. Stop current version
pm2 stop social-integrations

# 2. Checkout previous version
git checkout previous-tag

# 3. Install dependencies
npm install --production

# 4. Start previous version
pm2 start index.js --name "social-integrations"

# 5. Verify
curl http://localhost:3001/health
```

## Post-Deployment

1. **Verify Deployment**
   ```bash
   curl https://your-api.com/health
   ```

2. **Test Integrations**
   - Test WhatsApp connection
   - Test message sending
   - Monitor logs

3. **Update DNS**
   - Point domain to new server
   - Wait for propagation

4. **Monitor**
   - Watch error logs
   - Monitor performance
   - Check user feedback

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs social-integrations

# Check port
lsof -i :3001

# Check environment
env | grep NODE_ENV
```

### High Memory Usage

```bash
# Check memory
free -h

# Monitor process
top -p $(pgrep -f "node index.js")

# Restart
pm2 restart social-integrations
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U user -d social_integrations -c "SELECT 1"

# Check logs
tail -f /var/log/postgresql/postgresql.log
```

## Support & Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Deployment Complete!** 🚀

Your social integrations are now live in production.
