# 🚀 Руководство по развертыванию PressReach

Пошаговая инструкция для развертывания PressReach на VPS сервере.

## 📋 Требования

- **Сервер:** Ubuntu 20.04+ или Debian 11+
- **RAM:** минимум 2GB (рекомендуется 4GB)
- **Процессор:** 2 ядра
- **Место на диске:** минимум 10GB
- **IP адрес:** 31.31.196.9
- **SSH доступ:** root или пользователь с sudo

## 🔑 Необходимые ключи и данные

Перед началом подготовьте:

1. **Clerk Keys:**
   - Secret Key (начинается с `sk_test_...`)
   - Publishable Key (начинается с `pk_test_...`)
   - Получить на: https://dashboard.clerk.com

2. **DeepSeek API Key:**
   - Получить на: https://platform.deepseek.com

3. **SSH доступ к серверу:**
   - IP: 31.31.196.9
   - Логин: обычно `root` или `ubuntu`
   - Пароль или SSH ключ

## 🛠 Вариант 1: Автоматическая установка (Рекомендуется)

### Шаг 1: Подключение к серверу

```bash
ssh root@31.31.196.9
# или
ssh ubuntu@31.31.196.9
```

### Шаг 2: Скачивание скрипта установки

```bash
# Клонируем репозиторий
git clone https://github.com/knstn4/pressreach.git
cd pressreach/deploy

# Делаем скрипт исполняемым
chmod +x setup.sh
```

### Шаг 3: Редактирование конфигурации

Откройте файл `setup.sh` и отредактируйте переменные:

```bash
nano setup.sh
```

Измените:
- `POSTGRES_PASSWORD` - надёжный пароль для базы данных
- `CLERK_SECRET_KEY` - ваш Clerk secret key
- `DEEPSEEK_API_KEY` - ваш DeepSeek API key
- `DOMAIN` - ваш домен (если есть) или оставьте IP

### Шаг 4: Запуск установки

```bash
sudo ./setup.sh
```

Скрипт автоматически:
- Установит все зависимости (Python, Node.js, PostgreSQL, Nginx)
- Настроит базу данных
- Развернёт backend
- Соберёт и развернёт frontend
- Настроит Nginx
- Создаст systemd сервис

### Шаг 5: Проверка

```bash
# Проверка статуса backend
sudo systemctl status pressreach-backend

# Проверка логов
journalctl -u pressreach-backend.service -f

# Проверка Nginx
sudo nginx -t
```

Откройте в браузере: `http://31.31.196.9`

## 🔧 Вариант 2: Ручная установка

### 1. Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Установка PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y

# Создание базы данных и пользователя
sudo -u postgres psql
```

В PostgreSQL консоли:
```sql
CREATE USER pressreach WITH PASSWORD 'your_secure_password';
CREATE DATABASE pressreach OWNER pressreach;
GRANT ALL PRIVILEGES ON DATABASE pressreach TO pressreach;
\q
```

### 3. Установка Python и зависимостей

```bash
sudo apt install python3 python3-pip python3-venv -y

# Создание директории приложения
sudo mkdir -p /var/www/pressreach/backend
cd /var/www/pressreach/backend

# Клонирование backend
git clone https://github.com/knstn4/pressreach.git temp
cp -r temp/backend/* .
rm -rf temp

# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Настройка Backend

Создайте `.env` файл:

```bash
nano .env
```

Содержимое:
```env
DATABASE_URL=postgresql://pressreach:your_secure_password@localhost/pressreach
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
DEEPSEEK_API_KEY=your_deepseek_api_key
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://31.31.196.9,https://31.31.196.9
LOG_LEVEL=INFO
```

Инициализация базы:
```bash
python create_users_table.py
python seed_database.py
```

### 5. Установка Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 6. Сборка Frontend

```bash
cd /var/www/pressreach
git clone https://github.com/knstn4/pressreach.git temp
cd temp/front

# Создание .env.production
cat > .env.production << EOF
VITE_API_URL=http://31.31.196.9
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
EOF

npm install
npm run build

# Копирование собранных файлов
sudo mkdir -p /var/www/pressreach/frontend
sudo cp -r dist/* /var/www/pressreach/frontend/
```

### 7. Настройка Systemd сервиса

```bash
sudo nano /etc/systemd/system/pressreach-backend.service
```

Скопируйте содержимое из `deploy/backend.service`

```bash
sudo systemctl daemon-reload
sudo systemctl enable pressreach-backend
sudo systemctl start pressreach-backend
sudo systemctl status pressreach-backend
```

### 8. Установка и настройка Nginx

```bash
sudo apt install nginx -y

# Копирование конфигурации
sudo cp deploy/nginx.conf /etc/nginx/sites-available/pressreach

# Редактирование (замена YOUR_DOMAIN на ваш IP/домен)
sudo nano /etc/nginx/sites-available/pressreach

# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/pressreach /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Проверка и перезапуск
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Настройка SSL (HTTPS)

### Если у вас есть домен:

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое обновление
sudo systemctl enable certbot.timer
```

### Обновление конфигурации после SSL:

1. В `backend/.env` измените `CORS_ORIGINS` на `https://yourdomain.com`
2. В `front/.env.production` измените `VITE_API_URL` на `https://yourdomain.com`
3. Пересоберите frontend и перезапустите сервисы

## 🔍 Проверка работоспособности

### 1. Проверка Backend API:

```bash
curl http://31.31.196.9/health
# Ожидаемый ответ: {"status":"healthy"}
```

### 2. Проверка Frontend:

Откройте в браузере: `http://31.31.196.9`

### 3. Проверка логов:

```bash
# Backend логи
journalctl -u pressreach-backend.service -f

# Nginx логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 📝 Обновление приложения

### Обновление Backend:

```bash
cd /var/www/pressreach/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart pressreach-backend
```

### Обновление Frontend:

```bash
cd /tmp
git clone https://github.com/knstn4/pressreach.git
cd pressreach/front
npm install
npm run build
sudo cp -r dist/* /var/www/pressreach/frontend/
sudo systemctl restart nginx
```

## 🛠 Полезные команды

### Управление сервисами:

```bash
# Перезапуск backend
sudo systemctl restart pressreach-backend

# Просмотр статуса
sudo systemctl status pressreach-backend

# Просмотр логов
journalctl -u pressreach-backend.service -n 100

# Следить за логами в реальном времени
journalctl -u pressreach-backend.service -f
```

### Управление Nginx:

```bash
# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка конфигурации
sudo nginx -t

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
```

### База данных:

```bash
# Подключение к БД
sudo -u postgres psql -d pressreach

# Бэкап БД
sudo -u postgres pg_dump pressreach > backup_$(date +%Y%m%d).sql

# Восстановление БД
sudo -u postgres psql pressreach < backup_20241022.sql
```

## 🐛 Решение проблем

### Backend не запускается:

```bash
# Проверьте логи
journalctl -u pressreach-backend.service -n 50

# Проверьте .env файл
cat /var/www/pressreach/backend/.env

# Проверьте права доступа
ls -la /var/www/pressreach/backend/
```

### Frontend не отображается:

```bash
# Проверьте nginx конфигурацию
sudo nginx -t

# Проверьте логи nginx
sudo tail -f /var/log/nginx/error.log

# Проверьте файлы
ls -la /var/www/pressreach/frontend/
```

### Ошибки базы данных:

```bash
# Проверьте подключение
sudo -u postgres psql -d pressreach -c "SELECT 1;"

# Проверьте таблицы
sudo -u postgres psql -d pressreach -c "\dt"
```

## 🔐 Безопасность

### Рекомендации:

1. **Измените пароль PostgreSQL** после установки
2. **Используйте firewall:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
3. **Регулярно обновляйте систему:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Настройте автоматические бэкапы базы данных**
5. **Используйте SSL сертификат для HTTPS**

## 📧 Поддержка

При возникновении проблем:
1. Проверьте логи (см. раздел "Полезные команды")
2. Убедитесь, что все ключи API правильно настроены
3. Проверьте, что все сервисы запущены
4. Откройте issue на GitHub: https://github.com/knstn4/pressreach/issues

## 📚 Дополнительные ресурсы

- [Документация Nginx](https://nginx.org/ru/docs/)
- [Документация PostgreSQL](https://www.postgresql.org/docs/)
- [Документация Clerk](https://clerk.com/docs)
- [Документация FastAPI](https://fastapi.tiangolo.com/)
