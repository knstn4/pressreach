#!/bin/bash

echo "🚀 Запуск PressReach - AI генератора пресс-релизов"
echo "================================================"

# Проверяем наличие виртуального окружения
if [ ! -d "venv" ]; then
    echo "📦 Создаем виртуальное окружение..."
    python3 -m venv venv
fi

# Активируем виртуальное окружение
echo "🔧 Активируем виртуальное окружение..."
source venv/bin/activate

# Устанавливаем зависимости
echo "📋 Устанавливаем Python зависимости..."
pip install -r requirements.txt

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден!"
    echo "📝 Создайте файл .env на основе .env.example и добавьте ваш API ключ DeepSeek"
    cp .env.example .env
    echo "✅ Создан файл .env. Отредактируйте его перед запуском сервера."
    exit 1
fi

echo "🎯 Запускаем backend сервер..."
cd backend
python3 main.py