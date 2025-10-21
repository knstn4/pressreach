# ✅ Чек-лист подготовки к деплою PressReach

Используйте этот чек-лист чтобы ничего не забыть!

---

## 📋 ШАГ 1: Подготовка данных (СДЕЛАЙТЕ ДО НАЧАЛА)

### ☐ SSH доступ к серверу
- [ ] IP адреса: `31.31.196.9` ✅
- [ ] Логин для SSH: `___________` (обычно `root` или `ubuntu`)
- [ ] Пароль или SSH-ключ: `___________`
- [ ] Проверил подключение: `ssh root@31.31.196.9`

### ☐ Clerk API Keys
- [ ] Зарегистрировался на https://dashboard.clerk.com
- [ ] Создал приложение "PressReach"
- [ ] Скопировал **Secret Key**: `sk_test_...` → `___________`
- [ ] Скопировал **Publishable Key**: `pk_test_...` → `___________`

### ☐ DeepSeek API Key
- [ ] Зарегистрировался на https://platform.deepseek.com
- [ ] Создал API ключ
- [ ] Скопировал ключ: `sk-...` → `___________`

### ☐ Дополнительно (опционально)
- [ ] Есть домен: `___________` (если нет - будем использовать IP)
- [ ] DNS настроен на IP `31.31.196.9` (если есть домен)

---

## 🚀 ШАГ 2: Установка (ВЫБЕРИТЕ ОДИН ВАРИАНТ)

### Вариант А: Автоматическая установка ⚡

1. [ ] Подключился к серверу: `ssh root@31.31.196.9`
2. [ ] Установил Git: `apt install git -y`
3. [ ] Клонировал репо: 
   ```bash
   cd /root
   git clone https://github.com/knstn4/pressreach.git
   cd pressreach/deploy
   ```
4. [ ] Отредактировал `setup.sh`:
   ```bash
   nano setup.sh
   ```
   - [ ] Изменил `POSTGRES_PASSWORD`
   - [ ] Вставил `CLERK_SECRET_KEY`
   - [ ] Вставил `DEEPSEEK_API_KEY`
   - [ ] Сохранил файл (Ctrl+X → Y → Enter)

5. [ ] Запустил установку:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
6. [ ] Дождался завершения (5-10 минут)

### ИЛИ Вариант Б: Ручная установка 🛠

См. файл `DEPLOYMENT_GUIDE.md`

---

## 🔧 ШАГ 3: Настройка Clerk

1. [ ] Открыл Clerk Dashboard: https://dashboard.clerk.com
2. [ ] Выбрал приложение "PressReach"
3. [ ] В разделе **Domains** добавил:
   - [ ] `http://31.31.196.9` (или ваш домен)
   - [ ] `https://31.31.196.9` (если будет SSL)
4. [ ] В разделе **Settings → Home URL** установил: `http://31.31.196.9`
5. [ ] Проверил что ключи правильные

---

## ✅ ШАГ 4: Проверка работы

### На сервере:

1. [ ] Проверил статус backend:
   ```bash
   systemctl status pressreach-backend
   ```
   Должен показать: `active (running)` 🟢

2. [ ] Проверил логи backend:
   ```bash
   journalctl -u pressreach-backend.service -n 50
   ```
   Не должно быть красных ERROR

3. [ ] Проверил Nginx:
   ```bash
   systemctl status nginx
   ```
   Должен показать: `active (running)` 🟢

4. [ ] Проверил API:
   ```bash
   curl http://31.31.196.9/health
   ```
   Должен вернуть: `{"status":"healthy"}`

### В браузере:

1. [ ] Открыл `http://31.31.196.9`
2. [ ] Главная страница загрузилась ✅
3. [ ] Попробовал зарегистрироваться
4. [ ] Попробовал сгенерировать пресс-релиз
5. [ ] Всё работает! 🎉

---

## 🔒 ШАГ 5: Безопасность (ОБЯЗАТЕЛЬНО!)

1. [ ] Настроил firewall:
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. [ ] Изменил пароль PostgreSQL в `/var/www/pressreach/backend/.env`

3. [ ] Если есть домен - настроил SSL:
   ```bash
   certbot --nginx -d yourdomain.com
   ```

4. [ ] Настроил автоматическое обновление:
   ```bash
   apt install unattended-upgrades -y
   ```

---

## 📝 ШАГ 6: Сохраните эту информацию!

Запишите где-нибудь в безопасном месте:

```
=== PressReach Production ===
Сервер: 31.31.196.9
SSH Логин: ___________
SSH Пароль: ___________

PostgreSQL Password: ___________
Clerk Secret Key: sk_test_...___________
Clerk Publishable Key: pk_test_...___________
DeepSeek API Key: sk-___________

Домен (если есть): ___________

Backend логи: journalctl -u pressreach-backend.service -f
Перезапуск: systemctl restart pressreach-backend
Обновление: cd /root/pressreach/deploy && ./update.sh
```

---

## 🆘 Если что-то пошло не так:

### Backend не запускается:
```bash
journalctl -u pressreach-backend.service -n 100
```
Посмотрите на ошибки и проверьте `.env` файл

### Frontend показывает ошибки:
```bash
tail -f /var/log/nginx/error.log
```

### База данных не работает:
```bash
sudo -u postgres psql -d pressreach -c "SELECT 1;"
```

### API не отвечает:
Проверьте что backend запущен и Nginx правильно настроен

---

## 📞 Нужна помощь?

Пришлите мне:
1. На каком шаге застряли
2. Текст ошибки из логов
3. Что показывает браузер

Я помогу! 🚀

---

## ✨ После успешной установки:

- [ ] Протестировал все основные функции
- [ ] Сохранил все пароли и ключи
- [ ] Настроил резервное копирование БД (опционально)
- [ ] Радуюсь что всё работает! 🎉

**Поздравляю! Ваш PressReach в продакшене!** 🚀
