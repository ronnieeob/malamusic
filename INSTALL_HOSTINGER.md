# Metal Aloud - Hostinger Cloud Panel Installation Guide

## Prerequisites
- Hostinger Cloud Panel access
- SSH access to your server
- Domain pointed to your server's nameservers

## Server Details
- Site User: hstgr-srv685290
- Domain: srv685290.hstgr.cloud
- Root Directory: /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
- Database Name: Metalaloud
- Database User: Ronnie
- Database Password: Ronnie@2021!

## Step 1: Initial Server Setup

1. SSH into your server:
```bash
ssh hstgr-srv685290@srv685290.hstgr.cloud
```

2. Update system packages:
```bash
apt update && apt upgrade -y
```

3. Install required packages:
```bash
apt install -y nginx nodejs npm git
```

4. Install PM2 globally:
```bash
npm install -g pm2
```

## Step 2: Clone and Setup Application

1. Navigate to root directory:
```bash
cd /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
```

2. Clone repository:
```bash
git clone https://github.com/yourusername/metal-aloud.git .
```

3. Install dependencies:
```bash
npm install
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update environment variables:
```env
DB_HOST=srv685290.hstgr.cloud
DB_USER=Ronnie
DB_PASSWORD=Ronnie@2021!
DB_NAME=Metalaloud
DB_PORT=3306

# Domain Configuration
DOMAIN=srv685290.hstgr.cloud
ADMIN_EMAIL=admin@srv685290.hstgr.cloud

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Configure Apache

1. Create `.htaccess` in your domain root:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Protect sensitive files
<FilesMatch "^\.env|config\.json|composer\.json|package\.json|package-lock\.json">
  Order allow,deny
  Deny from all
</FilesMatch>

# Disable directory listing
Options -Indexes

# PHP settings
<IfModule mod_php.c>
  php_value upload_max_filesize 64M
  php_value post_max_size 64M
  php_value max_execution_time 300
  php_value max_input_time 300
</IfModule>
```

## Step 4: Build Application

1. Build the application:
```bash
npm run build
```

## Step 5: Database Setup

1. Access MySQL in Cloud Panel:
   - Go to "MySQL Databases"
   - Database name: Metalaloud
   - Username: Ronnie
   - Password: Ronnie@2021!

2. Import database schema:
```bash
mysql -h srv685290.hstgr.cloud -u Ronnie -pRonnie@2021! Metalaloud < database/schema.sql
```

## Step 6: Start Application

1. Start with PM2:
```bash
pm2 start npm --name "metal-aloud" -- start
pm2 save
pm2 startup
```

## Step 7: Set File Permissions

```bash
chmod -R 755 /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
find /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud -type f -exec chmod 644 {} \;
chmod 400 .env
```

## Maintenance

### Updating Application
```bash
cd /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
git pull
npm install
npm run build
pm2 restart metal-aloud
```

### Backup
```bash
# Database backup
mysqldump -h srv685290.hstgr.cloud -u Ronnie -p Metalaloud > backup.sql

# Files backup
tar -czf metal-aloud-backup.tar.gz /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
```

### Monitoring
```bash
# View logs
pm2 logs metal-aloud

# Monitor resources
pm2 monit

# Check Apache logs
tail -f /var/log/apache2/error.log
```

## Troubleshooting

1. If site shows 500 error:
   - Check Apache error logs
   - Verify .htaccess configuration
   - Check file permissions

2. If Node.js app won't start:
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables
   - Check port availability

3. If database connection fails:
   - Verify credentials
   - Check MySQL status
   - Test connection: `mysql -h srv685290.hstgr.cloud -u Ronnie -p`

## Security Recommendations

1. Keep system updated:
```bash
apt update && apt upgrade -y
```

2. Monitor access logs regularly
3. Enable automatic backups in Hostinger panel
4. Use strong passwords
5. Keep Node.js and npm packages updated

## Support

For additional support:
- Hostinger Support
- Metal Aloud Documentation
- Technical Support: support@metalaloud.com