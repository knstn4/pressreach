# 🎯 Краткая шпаргалка по командам

## 🔐 Подключение к серверу
```bash
ssh root@31.31.196.9
```

## 📦 Управление backend сервисом

### Статус
```bash
systemctl status pressreach-backend
```

### Перезапуск
```bash
systemctl restart pressreach-backend
```

### Остановка
```bash
systemctl stop pressreach-backend
```

### Запуск
```bash
systemctl start pressreach-backend
```

### Логи (последние 100 строк)
```bash
journalctl -u pressreach-backend.service -n 100
```

### Логи в реальном времени
```bash
journalctl -u pressreach-backend.service -f
```

## 🌐 Управление Nginx

### Статус
```bash
systemctl status nginx
```

### Перезапуск
```bash
systemctl restart nginx
```

### Проверка конфигурации
```bash
nginx -t
```

### Логи ошибок
```bash
tail -f /var/log/nginx/error.log
```

### Логи доступа
```bash
tail -f /var/log/nginx/access.log
```

## 💾 База данных PostgreSQL

### Подключение к БД
```bash
sudo -u postgres psql -d pressreach
```

### Бэкап БД
```bash
sudo -u postgres pg_dump pressreach > backup_$(date +%Y%m%d).sql
```

### Восстановление БД
```bash
sudo -u postgres psql pressreach < backup_20241022.sql
```

### Список таблиц
```bash
sudo -u postgres psql -d pressreach -c "\dt"
```

## 🔄 Обновление приложения

### Быстрое обновление (используйте готовый скрипт)
```bash
cd /root/pressreach/deploy
./update.sh
```

### Ручное обновление backend
```bash
cd /var/www/pressreach/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
systemctl restart pressreach-backend
```

### Ручное обновление frontend
```bash
cd /tmp
git clone https://github.com/knstn4/pressreach.git
cd pressreach/front
npm install
npm run build
cp -r dist/* /var/www/pressreach/frontend/
systemctl restart nginx
```

## 📝 Просмотр конфигураций

### Backend .env
```bash
cat /var/www/pressreach/backend/.env
```

### Nginx конфиг
```bash
cat /etc/nginx/sites-available/pressreach
```

### Systemd сервис
```bash
cat /etc/systemd/system/pressreach-backend.service
```

## 🔍 Диагностика

### Проверка здоровья API
```bash
curl http://31.31.196.9/health
```

### Проверка какие порты слушаются
```bash
netstat -tlnp | grep -E '(8000|80|443)'
```

### Использование диска
```bash
df -h
```

### Использование памяти
```bash
free -m
```

### Процессы Python
```bash
ps aux | grep python
```

### Процессы Nginx
```bash
ps aux | grep nginx
```

## 🔒 Безопасность

### Настройка firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

### Смена пароля PostgreSQL
```bash
sudo -u postgres psql
ALTER USER pressreach WITH PASSWORD 'новый_пароль';
\q
# Не забудьте обновить в /var/www/pressreach/backend/.env
```

## 🆘 Аварийные действия

### Полный перезапуск всех сервисов
```bash
systemctl restart pressreach-backend
systemctl restart nginx
systemctl restart postgresql
```

### Очистка логов (если диск заполнен)
```bash
journalctl --vacuum-time=7d
rm -f /var/log/nginx/*.log.*.gz
```

### Проверка дискового пространства
```bash
du -sh /var/www/pressreach/*
du -sh /var/log/*
```

## 📊 Мониторинг

### Топ процессов по CPU
```bash
top
# Нажмите 'q' для выхода
```

### Топ процессов по памяти
```bash
htop
# Нажмите 'q' для выхода
# Если htop не установлен: apt install htop
```

### Непрерывный мониторинг логов
```bash
# Backend
journalctl -u pressreach-backend.service -f

# Nginx
tail -f /var/log/nginx/error.log /var/log/nginx/access.log
```

## 🔧 Редактирование файлов на сервере

### Nano (простой редактор)
```bash
nano /var/www/pressreach/backend/.env
# Ctrl+X для выхода, Y для сохранения
```

### Vim (продвинутый редактор)
```bash
vim /var/www/pressreach/backend/.env
# i для входа в режим редактирования
# Esc :wq для сохранения и выхода
# Esc :q! для выхода без сохранения
```

---

## 🎯 Полезные алиасы (добавьте в ~/.bashrc)

```bash
# Откройте файл
nano ~/.bashrc

# Добавьте в конец:
alias pr-status='systemctl status pressreach-backend'
alias pr-restart='systemctl restart pressreach-backend'
alias pr-logs='journalctl -u pressreach-backend.service -f'
alias pr-update='cd /root/pressreach/deploy && ./update.sh'
alias nginx-restart='systemctl restart nginx'
alias nginx-logs='tail -f /var/log/nginx/error.log'

# Сохраните и примените:
source ~/.bashrc
```

Теперь можно использовать короткие команды:
- `pr-status` - статус backend
- `pr-restart` - перезапуск backend
- `pr-logs` - логи backend
- `pr-update` - обновление приложения
- `nginx-restart` - перезапуск nginx
- `nginx-logs` - логи nginx

---

**Сохраните эту шпаргалку** - она очень пригодится! 📌
