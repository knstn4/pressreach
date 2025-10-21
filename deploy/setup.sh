#!/bin/bash
# Automated setup script for PressReach on Ubuntu/Debian server
# Run as root or with sudo

set -e  # Exit on error

echo "🚀 Starting PressReach deployment setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables - EDIT THESE
SERVER_IP="31.31.196.9"
DOMAIN="${DOMAIN:-$SERVER_IP}"  # Use domain if set, otherwise IP
APP_DIR="/var/www/pressreach"
POSTGRES_PASSWORD="pressreach_secure_password_change_me"
CLERK_SECRET_KEY="your_clerk_secret_key_here"
DEEPSEEK_API_KEY="your_deepseek_api_key_here"

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update
apt upgrade -y

echo -e "${YELLOW}Step 2: Installing required packages...${NC}"
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    curl \
    certbot \
    python3-certbot-nginx

echo -e "${YELLOW}Step 3: Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${YELLOW}Step 4: Setting up PostgreSQL...${NC}"
sudo -u postgres psql -c "CREATE USER pressreach WITH PASSWORD '$POSTGRES_PASSWORD';" || true
sudo -u postgres psql -c "CREATE DATABASE pressreach OWNER pressreach;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pressreach TO pressreach;" || true

echo -e "${YELLOW}Step 5: Creating application directories...${NC}"
mkdir -p $APP_DIR/{backend,frontend}
mkdir -p /var/log/pressreach
chown -R www-data:www-data $APP_DIR
chown -R www-data:www-data /var/log/pressreach

echo -e "${YELLOW}Step 6: Cloning repository...${NC}"
cd /tmp
if [ -d "pressreach" ]; then
    rm -rf pressreach
fi
git clone git@github.com:knstn4/pressreach.git
cd pressreach

echo -e "${YELLOW}Step 7: Setting up backend...${NC}"
cp -r backend/* $APP_DIR/backend/
cd $APP_DIR/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=postgresql://pressreach:$POSTGRES_PASSWORD@localhost/pressreach

# Clerk Authentication
CLERK_SECRET_KEY=$CLERK_SECRET_KEY

# DeepSeek API
DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY

# Server settings
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://$DOMAIN,https://$DOMAIN

# Logging
LOG_LEVEL=INFO
EOF

chown www-data:www-data .env
chmod 600 .env

# Initialize database
python create_users_table.py
python seed_database.py

echo -e "${YELLOW}Step 8: Building frontend...${NC}"
cd /tmp/pressreach/front

# Update API URL in frontend
cat > .env.production << EOF
VITE_API_URL=http://$DOMAIN
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
EOF

npm install
npm run build

# Copy built files
cp -r dist/* $APP_DIR/frontend/
chown -R www-data:www-data $APP_DIR/frontend

echo -e "${YELLOW}Step 9: Setting up systemd service...${NC}"
cp /tmp/pressreach/deploy/backend.service /etc/systemd/system/pressreach-backend.service
systemctl daemon-reload
systemctl enable pressreach-backend.service
systemctl start pressreach-backend.service

echo -e "${YELLOW}Step 10: Configuring Nginx...${NC}"
cp /tmp/pressreach/deploy/nginx.conf /etc/nginx/sites-available/pressreach
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/pressreach
ln -sf /etc/nginx/sites-available/pressreach /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${GREEN}Your PressReach instance is now running at:${NC}"
echo -e "${GREEN}http://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Important next steps:${NC}"
echo "1. Update Clerk keys in backend/.env and rebuild frontend with correct VITE_CLERK_PUBLISHABLE_KEY"
echo "2. Update DeepSeek API key in backend/.env"
echo "3. Change PostgreSQL password in backend/.env"
echo "4. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN"
echo "5. Check backend logs: journalctl -u pressreach-backend.service -f"
echo "6. Check Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "- Restart backend: sudo systemctl restart pressreach-backend"
echo "- Restart Nginx: sudo systemctl restart nginx"
echo "- View backend logs: journalctl -u pressreach-backend.service -f"
echo "- Check service status: sudo systemctl status pressreach-backend"
