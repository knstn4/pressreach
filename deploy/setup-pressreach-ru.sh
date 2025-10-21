#!/bin/bash
# Automated setup script for PressReach on pressreach.ru
# Server: 185.104.251.237
# Domain: pressreach.ru
# Run as root or with sudo

set -e  # Exit on error

echo "🚀 Starting PressReach deployment setup for pressreach.ru..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables - ЗАПОЛНИТЕ ЭТИ ЗНАЧЕНИЯ ПЕРЕД ЗАПУСКОМ!
SERVER_IP="185.104.251.237"
DOMAIN="pressreach.ru"
APP_DIR="/var/www/pressreach"
POSTGRES_PASSWORD="YOUR_SECURE_DB_PASSWORD_HERE"  # Придумайте надёжный пароль
CLERK_SECRET_KEY="YOUR_CLERK_SECRET_KEY_HERE"      # sk_test_...
CLERK_PUBLISHABLE_KEY="YOUR_CLERK_PUBLISHABLE_KEY_HERE"  # pk_test_...
DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY_HERE"      # sk-...

# Проверка что все ключи заменены
if [[ "$POSTGRES_PASSWORD" == "YOUR_SECURE_DB_PASSWORD_HERE" ]] || \
   [[ "$CLERK_SECRET_KEY" == "YOUR_CLERK_SECRET_KEY_HERE" ]] || \
   [[ "$DEEPSEEK_API_KEY" == "YOUR_DEEPSEEK_API_KEY_HERE" ]]; then
    echo -e "${RED}ОШИБКА: Вы не заполнили все необходимые переменные!${NC}"
    echo -e "${YELLOW}Откройте файл в редакторе и замените:${NC}"
    echo "  - YOUR_SECURE_DB_PASSWORD_HERE"
    echo "  - YOUR_CLERK_SECRET_KEY_HERE"
    echo "  - YOUR_CLERK_PUBLISHABLE_KEY_HERE"
    echo "  - YOUR_DEEPSEEK_API_KEY_HERE"
    exit 1
fi

echo -e "${GREEN}Конфигурация:${NC}"
echo "  IP: $SERVER_IP"
echo "  Домен: $DOMAIN"
echo "  Директория: $APP_DIR"

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt update
apt upgrade -y

echo -e "${YELLOW}Step 2: Installing required packages...${NC}"
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    curl \
    certbot \
    python3-certbot-nginx \
    build-essential \
    libpq-dev

echo -e "${YELLOW}Step 3: Installing Node.js 20.x and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверка версий
echo -e "${GREEN}Installed versions:${NC}"
python3 --version
node --version
npm --version
psql --version

echo -e "${YELLOW}Step 4: Setting up PostgreSQL...${NC}"
# Запуск PostgreSQL если не запущен
systemctl start postgresql
systemctl enable postgresql

# Создание пользователя и базы данных
sudo -u postgres psql -c "CREATE USER pressreach WITH PASSWORD '$POSTGRES_PASSWORD';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "CREATE DATABASE pressreach OWNER pressreach;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pressreach TO pressreach;"

# Для PostgreSQL 15+ нужны дополнительные права
sudo -u postgres psql -d pressreach -c "GRANT ALL ON SCHEMA public TO pressreach;" 2>/dev/null || true

echo -e "${GREEN}PostgreSQL configured successfully${NC}"

echo -e "${YELLOW}Step 5: Creating application directories...${NC}"
mkdir -p $APP_DIR/{backend,frontend}
mkdir -p /var/log/pressreach

echo -e "${YELLOW}Step 6: Cloning repository from GitHub...${NC}"
cd /tmp
if [ -d "pressreach" ]; then
    rm -rf pressreach
fi

# Клонирование через HTTPS (не требует SSH ключей)
git clone https://github.com/knstn4/pressreach.git
cd pressreach

echo -e "${YELLOW}Step 7: Setting up backend...${NC}"
cp -r backend/* $APP_DIR/backend/
cd $APP_DIR/backend

# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}Python packages installed${NC}"

# Создание .env файла
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
CORS_ORIGINS=http://$DOMAIN,https://$DOMAIN,http://$SERVER_IP,https://$SERVER_IP

# Logging
LOG_LEVEL=INFO
EOF

chmod 600 .env

echo -e "${GREEN}Backend .env created${NC}"

# Инициализация базы данных
echo -e "${YELLOW}Initializing database...${NC}"
python3 create_users_table.py || echo "Tables creation skipped or failed"
python3 seed_database.py || echo "Database seeding skipped or failed"

echo -e "${GREEN}Database initialized${NC}"

echo -e "${YELLOW}Step 8: Building frontend...${NC}"
cd /tmp/pressreach/front

# Создание .env.production для frontend
cat > .env.production << EOF
VITE_API_URL=https://$DOMAIN
VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
EOF

echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install

echo -e "${GREEN}Building frontend...${NC}"
npm run build

# Копирование собранных файлов
cp -r dist/* $APP_DIR/frontend/

echo -e "${GREEN}Frontend built and deployed${NC}"

echo -e "${YELLOW}Step 9: Setting up systemd service...${NC}"

# Создание systemd service файла
cat > /etc/systemd/system/pressreach-backend.service << 'EOF'
[Unit]
Description=PressReach Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/pressreach/backend
Environment="PATH=/var/www/pressreach/backend/venv/bin"
EnvironmentFile=/var/www/pressreach/backend/.env
ExecStart=/var/www/pressreach/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

Restart=always
RestartSec=10

StandardOutput=append:/var/log/pressreach/backend.log
StandardError=append:/var/log/pressreach/backend-error.log

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Установка прав на директории
chown -R www-data:www-data $APP_DIR
chown -R www-data:www-data /var/log/pressreach

# Запуск сервиса
systemctl daemon-reload
systemctl enable pressreach-backend.service
systemctl start pressreach-backend.service

echo -e "${GREEN}Backend service started${NC}"

# Проверка статуса
sleep 3
systemctl status pressreach-backend.service --no-pager || true

echo -e "${YELLOW}Step 10: Configuring Nginx...${NC}"

# Создание конфигурации Nginx
cat > /etc/nginx/sites-available/pressreach << EOF
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $SERVER_IP;

    client_max_body_size 10M;

    # Frontend static files
    location / {
        root $APP_DIR/frontend;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend root endpoints
    location ~ ^/(generate-press-release|improve-text|health)$ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/pressreach /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}Nginx configured and started${NC}"

echo -e "${YELLOW}Step 11: Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable || true
ufw status

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${GREEN}Your PressReach instance is now running at:${NC}"
echo -e "${GREEN}http://$DOMAIN${NC}"
echo -e "${GREEN}http://$SERVER_IP${NC}"
echo ""
echo -e "${YELLOW}Important next steps:${NC}"
echo "1. Configure DNS: Point $DOMAIN A record to $SERVER_IP"
echo "2. Wait for DNS propagation (can take up to 24 hours)"
echo "3. Set up SSL certificate:"
echo -e "   ${GREEN}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Configure Clerk Dashboard:${NC}"
echo "1. Go to https://dashboard.clerk.com"
echo "2. Add these URLs to Allowed Origins:"
echo "   - https://$DOMAIN"
echo "   - http://$DOMAIN"
echo "3. Set Home URL to: https://$DOMAIN"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "- Check backend status: sudo systemctl status pressreach-backend"
echo "- View backend logs: journalctl -u pressreach-backend.service -f"
echo "- Restart backend: sudo systemctl restart pressreach-backend"
echo "- Restart Nginx: sudo systemctl restart nginx"
echo "- Check Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
echo -e "${GREEN}🎉 PressReach is ready!${NC}"
