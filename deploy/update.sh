#!/bin/bash
# Quick update script for PressReach
# Run this when you want to deploy new changes

set -e

echo "🔄 Updating PressReach..."

APP_DIR="/var/www/pressreach"

# Update backend
echo "📦 Updating backend..."
cd $APP_DIR/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart pressreach-backend

# Update frontend
echo "🎨 Updating frontend..."
cd /tmp
rm -rf pressreach-update
git clone https://github.com/knstn4/pressreach.git pressreach-update
cd pressreach-update/front
npm install
npm run build
sudo cp -r dist/* $APP_DIR/frontend/
cd /tmp
rm -rf pressreach-update

echo "♻️ Restarting services..."
sudo systemctl restart nginx

echo "✅ Update complete!"
echo "Check status: sudo systemctl status pressreach-backend"
