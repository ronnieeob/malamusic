#!/bin/bash

# Metal Aloud Deployment Script for Hostinger VPS

# Exit on error
set -e

echo "🎸 Deploying Metal Aloud to Hostinger..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit 1
fi

# Load environment variables
source .env

# Connect to Hostinger database
echo "🗄️ Connecting to Hostinger database..."
mysql -h ${HOSTINGER_DB_HOST} -u ${HOSTINGER_DB_USER} -p${HOSTINGER_DB_PASSWORD} ${HOSTINGER_DB_NAME} < database/schema.sql

# Build application
echo "🏗️ Building application..."
npm install
npm run build

# Upload to Hostinger via FTP
echo "📂 Uploading files to Hostinger..."
lftp -u ${HOSTINGER_FTP_USER},${HOSTINGER_FTP_PASSWORD} -e "
  set ssl:verify-certificate no;
  mirror -R dist/ /public_html/;
  bye
" ftp://srv685290.hstgr.cloud
