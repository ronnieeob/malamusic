# Metal Aloud - Hostinger VPS Deployment Guide

## Prerequisites
1. Hostinger VPS with Ubuntu 20.04 or higher
2. Domain pointed to Hostinger nameservers
3. SSH access to your VPS
4. MySQL database created in Hostinger panel

## Step 1: Initial Server Setup

1. SSH into your VPS:
```bash
ssh root@your-server-ip
```

2. Create a new user:
```bash
adduser metal_aloud
usermod -aG sudo metal_aloud
```

3. Update system and install required packages:
```bash
apt update && apt upgrade -y
apt install -y nginx mysql-client php8.1-fpm php8.1-mysql \
  nodejs npm certbot python3-certbot-nginx git ufw fail2ban
```

4. Install Node.js 18:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

5. Install PM2:
```bash
npm install -g pm2
```

## Step 2: Configure MySQL

1. Create database and user:
```sql
CREATE DATABASE metal_aloud;
CREATE USER 'metal_aloud'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON metal_aloud.* TO 'metal_aloud'@'localhost';
FLUSH PRIVILEGES;
```

2. Import schema:
```bash
mysql -u metal_aloud -p metal_aloud < database/schema.sql
```

## Step 3: Configure Nginx

1. Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/metal-aloud
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/metal-aloud/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(\.env|composer\.json|package\.json|package-lock\.json)$ {
        deny all;
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

2. Enable site:
```bash
ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

## Step 4: Deploy Application

1. Clone repository:
```bash
cd /var/www
git clone https://github.com/yourusername/metal-aloud.git
cd metal-aloud
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables:
```env
DB_HOST=localhost
DB_USER=metal_aloud
DB_PASSWORD=your_password
DB_NAME=metal_aloud
DB_PORT=3306

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

5. Build application:
```bash
npm run build
```

6. Set up PM2:
```bash
pm2 start npm --name "metal-aloud" -- start
pm2 save
pm2 startup
```

## Step 5: SSL Setup

1. Install SSL certificate:
```bash
certbot --nginx -d your-domain.com
```

## Step 6: Security Setup

1. Configure firewall:
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

2. Configure fail2ban:
```bash
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Add to jail.local:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https"]
logpath = /var/log/nginx/error.log
findtime = 600
maxretry = 10
bantime = 7200
```

3. Set file permissions:
```bash
chown -R www-data:www-data /var/www/metal-aloud
find /var/www/metal-aloud -type d -exec chmod 755 {} \;
find /var/www/metal-aloud -type f -exec chmod 644 {} \;
chmod 400 .env
```

## Step 7: Monitoring Setup

1. Configure PM2 monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

2. Set up log rotation:
```bash
nano /etc/logrotate.d/metal-aloud
```

Add:
```
/var/log/metal-aloud/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
    endscript
}
```

## Step 8: Backup Setup

1. Create backup script:
```bash
nano /root/backup-metal-aloud.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=/var/backups/metal-aloud
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u metal_aloud -p metal_aloud > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/metal-aloud

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

2. Make executable and schedule:
```bash
chmod +x /root/backup-metal-aloud.sh
crontab -e
```

Add:
```
0 2 * * * /root/backup-metal-aloud.sh
```

## Maintenance

1. Update application:
```bash
cd /var/www/metal-aloud
git pull
npm install
npm run build
pm2 restart metal-aloud
```

2. Monitor logs:
```bash
# Application logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Security logs
tail -f /var/log/auth.log
fail2ban-client status
```

3. Database maintenance:
```sql
ANALYZE TABLE users, songs, products, orders;
OPTIMIZE TABLE users, songs, products, orders;
```

## Support
For additional support:
- Check documentation
- Contact support@metalaloud.com