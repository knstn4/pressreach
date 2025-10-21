# 🚀 Инструкция по развёртыванию PressReach на pressreach.ru

## 📦 Ваши данные:
- **Сервер IP:** 185.104.251.237
- **Домен:** pressreach.ru
- **ОС:** Ubuntu 24.04
- **Хостинг:** FirstByte VPS

---

## ⚠️ ПРОБЛЕМА: SSH не подключается

Пароли которые вы указали не подходят. Нужно:

### Вариант 1: Через веб-консоль FirstByte (РЕКОМЕНДУЕТСЯ)

1. **Зайдите в панель управления FirstByte**
2. **Найдите ваш VPS** в списке услуг
3. **Откройте веб-консоль** (кнопка "Console" или "VNC")
   - Это позволит работать с сервером прямо в браузере
4. **Войдите как root** используя пароль: `T43Ygi0553V9`

### Вариант 2: Сброс пароля

1. В панели FirstByte найдите **"Сбросить пароль root"**
2. Сбросьте пароль и запомните новый
3. Попробуйте подключиться снова:
   ```bash
   ssh root@185.104.251.237
   ```

---

## 🔑 ЧТО НУЖНО ПОЛУЧИТЬ ПЕРЕД УСТАНОВКОЙ:

### 1. Clerk API Keys (5 минут)

1. Откройте: https://dashboard.clerk.com
2. Зарегистрируйтесь (можно через Google)
3. Создайте приложение "PressReach"
4. Скопируйте ключи:

```
Clerk Secret Key: sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Clerk Publishable Key: pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. DeepSeek API Key (5 минут)

1. Откройте: https://platform.deepseek.com
2. Зарегистрируйтесь
3. Создайте API ключ
4. Скопируйте:

```
DeepSeek API Key: sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🚀 УСТАНОВКА (через веб-консоль)

### Шаг 1: Откройте веб-консоль

1. Зайдите в панель FirstByte
2. Найдите ваш VPS
3. Нажмите кнопку **"Console"** или **"Веб-консоль"**
4. Войдите как **root** с паролем `T43Ygi0553V9`

### Шаг 2: Обновите систему

```bash
apt update
apt upgrade -y
```

Это займёт 2-3 минуты.

### Шаг 3: Установите Git

```bash
apt install git -y
```

### Шаг 4: Скачайте PressReach

```bash
cd /root
git clone https://github.com/knstn4/pressreach.git
cd pressreach/deploy
```

### Шаг 5: Отредактируйте скрипт установки

```bash
nano setup-pressreach-ru.sh
```

**Найдите и замените эти строки:**

```bash
POSTGRES_PASSWORD="YOUR_SECURE_DB_PASSWORD_HERE"  # Придумайте свой пароль
CLERK_SECRET_KEY="YOUR_CLERK_SECRET_KEY_HERE"     # Вставьте sk_test_...
CLERK_PUBLISHABLE_KEY="YOUR_CLERK_PUBLISHABLE_KEY_HERE"  # Вставьте pk_test_...
DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY_HERE"     # Вставьте sk-...
```

**Пример после замены:**
```bash
POSTGRES_PASSWORD="MySecurePass123!"
CLERK_SECRET_KEY="sk_test_abc123xyz..."
CLERK_PUBLISHABLE_KEY="pk_test_def456uvw..."
DEEPSEEK_API_KEY="sk-ghi789rst..."
```

**Сохраните файл:**
- Нажмите `Ctrl + X`
- Нажмите `Y`
- Нажмите `Enter`

### Шаг 6: Запустите установку

```bash
chmod +x setup-pressreach-ru.sh
./setup-pressreach-ru.sh
```

**ПОДОЖДИТЕ 10-15 минут!** Скрипт установит всё автоматически:
- Python, Node.js, PostgreSQL, Nginx
- Backend с зависимостями
- Frontend (соберёт React приложение)
- Настроит сервисы

### Шаг 7: Проверьте что всё работает

После завершения проверьте статус:

```bash
systemctl status pressreach-backend
```

Должно показать: **active (running)** зелёным цветом

Проверьте API:
```bash
curl http://localhost:8000/health
```

Должно вернуть: `{"status":"healthy"}`

---

## 🌐 НАСТРОЙКА ДОМЕНА

### Шаг 1: Настройте DNS в Reg.ru

1. Зайдите в личный кабинет Reg.ru
2. Найдите домен **pressreach.ru**
3. Перейдите в **"Управление DNS"**
4. Добавьте/измените A-записи:

```
Тип    Субдомен    Значение           TTL
A      @           185.104.251.237    3600
A      www         185.104.251.237    3600
```

5. Сохраните изменения

**Важно:** DNS может обновляться до 24 часов, но обычно работает через 1-2 часа

### Шаг 2: Проверьте DNS

Через 10-15 минут проверьте:

```bash
ping pressreach.ru
```

Должен показать IP: 185.104.251.237

### Шаг 3: Проверьте сайт

Откройте в браузере:
```
http://pressreach.ru
```

Должна открыться главная страница PressReach! 🎉

---

## 🔒 НАСТРОЙКА SSL (HTTPS)

**После того как DNS заработает** (сайт открывается по http://pressreach.ru):

```bash
certbot --nginx -d pressreach.ru -d www.pressreach.ru
```

Certbot спросит:
1. **Email:** введите ваш email
2. **Terms of Service:** нажмите `Y` (да)
3. **Share email:** можно нажать `N` (нет)
4. **Redirect HTTP to HTTPS:** нажмите `2` (да, редирект)

Готово! Теперь ваш сайт доступен по **https://pressreach.ru** 🔒

---

## ⚙️ НАСТРОЙКА CLERK

1. Откройте: https://dashboard.clerk.com
2. Выберите приложение "PressReach"
3. В разделе **"Domains"** добавьте:
   - `https://pressreach.ru`
   - `http://pressreach.ru`
4. В **"Home URL"** установите: `https://pressreach.ru`
5. Сохраните

---

## ✅ ПРОВЕРКА РАБОТЫ

### 1. Откройте сайт
```
https://pressreach.ru
```

### 2. Попробуйте зарегистрироваться

### 3. Попробуйте создать пресс-релиз

### 4. Проверьте логи если что-то не работает:

```bash
# Backend логи
journalctl -u pressreach-backend.service -f

# Nginx логи
tail -f /var/log/nginx/error.log
```

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ

### Перезапуск сервисов:
```bash
systemctl restart pressreach-backend
systemctl restart nginx
```

### Просмотр логов:
```bash
# Backend
journalctl -u pressreach-backend.service -n 100

# Nginx
tail -f /var/log/nginx/error.log
```

### Проверка статуса:
```bash
systemctl status pressreach-backend
systemctl status nginx
systemctl status postgresql
```

### Обновление приложения:
```bash
cd /root/pressreach/deploy
git pull
./update.sh
```

---

## 🆘 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Backend не запускается:
```bash
journalctl -u pressreach-backend.service -n 100
```
Посмотрите на ошибки. Обычно проблема в неправильных ключах в `.env`

### Frontend не отображается:
```bash
ls -la /var/www/pressreach/frontend/
```
Проверьте что файлы собрались

### База данных не работает:
```bash
sudo -u postgres psql -d pressreach -c "SELECT 1;"
```

### Сайт не открывается:
1. Проверьте DNS: `ping pressreach.ru`
2. Проверьте Nginx: `systemctl status nginx`
3. Проверьте firewall: `ufw status`

---

## 📞 ТЕХПОДДЕРЖКА

Если нужна помощь, соберите информацию:

```bash
# Статус всех сервисов
systemctl status pressreach-backend --no-pager
systemctl status nginx --no-pager
systemctl status postgresql --no-pager

# Логи backend (последние 50 строк)
journalctl -u pressreach-backend.service -n 50

# Конфигурация
cat /var/www/pressreach/backend/.env
```

И напишите мне с описанием проблемы!

---

## 🎉 ГОТОВО!

После всех шагов ваш PressReach будет работать на **https://pressreach.ru**!

Удачи с проектом! 🚀
