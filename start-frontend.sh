#!/bin/bash

echo "🎨 Запуск Frontend для PressReach"
echo "================================"

cd front

# Проверяем наличие node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем Node.js зависимости..."
    npm install
fi

echo "🚀 Запускаем Vite приложение..."
npm run dev