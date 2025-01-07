# Metal Aloud - Linux Installation Guide

## Prerequisites

1. Node.js 18+ and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Git
```bash
sudo apt-get install git
```

3. PostgreSQL 14+
```bash
sudo apt install postgresql postgresql-contrib
```

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/metal-aloud.git
cd metal-aloud
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=metal_aloud
DB_PASSWORD=your_password
DB_NAME=metal_aloud
DB_PORT=5432

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Spotify Configuration
VITE_SPOTIFY_CLIENT_ID=ccb639c2b9254c0fb25596a2f6aba562
VITE_SPOTIFY_CLIENT_SECRET=b6ac2a5a3e7441c8b5afcb0707264c44
```

4. Set up the database:
```bash
# Create database and user
sudo -u postgres psql
postgres=# CREATE DATABASE metal_aloud;
postgres=# CREATE USER metal_aloud WITH ENCRYPTED PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE metal_aloud TO metal_aloud;
postgres=# \q

# Run migrations
npm run migrate
```

5. Build the application:
```bash
npm run build
```

6. Start the development server:
```bash
npm run dev
```

## Production Deployment

1. Install PM2 for process management:
```bash
sudo npm install -g pm2
```

2. Build for production:
```bash
npm run build
```

3. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. Configure Nginx:
```bash
sudo apt install nginx
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/metal-aloud
```

Add the configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Set up SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Maintenance

1. Update application:
```bash
git pull
npm install
npm run build
pm2 restart all
```

2. Monitor logs:
```bash
pm2 logs
```

3. View status:
```bash
pm2 status
```

4. Database backup:
```bash
pg_dump -U metal_aloud metal_aloud > backup.sql
```

## Troubleshooting

1. If the application won't start:
   - Check logs: `pm2 logs`
   - Verify environment variables
   - Check database connection
   - Ensure ports are available

2. Database connection issues:
   - Check PostgreSQL status: `sudo systemctl status postgresql`
   - Verify database credentials
   - Check firewall settings

3. Nginx issues:
   - Check error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify configuration: `sudo nginx -t`
   - Check SSL certificates: `sudo certbot certificates`

## Security Recommendations

1. Enable firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

2. Set up fail2ban:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. Regular updates:
```bash
sudo apt update
sudo apt upgrade
```

4. Secure PostgreSQL:
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

5. Set proper file permissions:
```bash
sudo chown -R $USER:$USER /var/www/metal-aloud
find /var/www/metal-aloud -type d -exec chmod 755 {} \;
find /var/www/metal-aloud -type f -exec chmod 644 {} \;
```

## Support

For additional support:
- Check the [GitHub repository](https://github.com/yourusername/metal-aloud)
- Join our Discord community
- Contact support@metalaloud.com