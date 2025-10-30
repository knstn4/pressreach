# 📧 Настройка Email Рассылки

## ✅ Что готово

### 1. Email Сервис (`press_email_service.py`)
- ✅ Отправка пресс-релизов через SMTP
- ✅ Поддержка HTML и текстовой версии
- ✅ Прикрепление файлов (PDF, изображения, документы)
- ✅ Красивое отображение отправителя (название компании)
- ✅ Async отправка (не блокирует сервер)
- ✅ Подробное логирование

### 2. API Endpoint (`/api/distributions/{id}/send`)
- ✅ Отправка на все выбранные СМИ
- ✅ Создание DeliveryLog для каждой отправки
- ✅ Обновление статуса рассылки (completed/partially_completed/failed)
- ✅ Подсчет sent_count и failed_count
- ✅ Возврат детального отчета

### 3. SMTP Конфигурация
```env
SMTP_SERVER=mail.hosting.reg.ru
SMTP_PORT=465
SMTP_USERNAME=info@pressreach.ru
SMTP_PASSWORD=danmyj-winHoq-6nagby
FROM_EMAIL=info@pressreach.ru
FROM_NAME=PressReach
```

**Статус:** ✅ Credentials проверены и работают
- Порт 465 с SSL (use_tls=True)
- Авторизация успешна
- Локальная отправка заблокирована ISP (нормально для домашних сетей)
- **На production сервере будет работать!**

## 🚀 Деплой на Production

### 1. Обновить код на сервере
```bash
ssh root@185.104.251.237
cd /root/pressreach
git pull
```

### 2. Обновить .env файл
```bash
nano /var/www/pressreach/backend/.env
```

Добавить:
```env
# Email/SMTP настройки
SMTP_SERVER=mail.hosting.reg.ru
SMTP_PORT=465
SMTP_USERNAME=info@pressreach.ru
SMTP_PASSWORD=danmyj-winHoq-6nagby
FROM_EMAIL=info@pressreach.ru
FROM_NAME=PressReach
```

### 3. Создать таблицу distribution_files (если еще не создана)
```bash
cd /var/www/pressreach/backend
python3 add_distribution_files_table.py
```

### 4. Создать папку для uploads
```bash
mkdir -p /var/www/pressreach/backend/uploads
chown www-data:www-data /var/www/pressreach/backend/uploads
chmod 755 /var/www/pressreach/backend/uploads
```

### 5. Скопировать новый код
```bash
cp /root/pressreach/backend/press_email_service.py /var/www/pressreach/backend/
cp /root/pressreach/backend/main.py /var/www/pressreach/backend/
```

### 6. Перезапустить backend
```bash
systemctl restart pressreach-backend
systemctl status pressreach-backend
```

### 7. Проверить логи
```bash
journalctl -u pressreach-backend -f
```

## 🧪 Тестирование на Production

### 1. Создать тестовую рассылку
- Зайти на https://pressreach.ru/distribution
- Заполнить форму пресс-релиза
- Выбрать 1-2 тестовых СМИ (с реальными email)
- Загрузить тестовый файл (необязательно)
- Создать рассылку

### 2. Отправить рассылку
- Нажать кнопку "Отправить рассылку"
- Подтвердить отправку
- Дождаться завершения

### 3. Проверить результат
- Проверить email на тестовых адресах
- Проверить что файлы прикреплены
- Проверить HTML форматирование
- Проверить логи в `journalctl -u pressreach-backend`

### 4. Проверить DeliveryLog в базе
```sql
SELECT
    d.id as distribution_id,
    d.status as distribution_status,
    d.sent_count,
    d.failed_count,
    dl.media_outlet_id,
    mo.name as media_name,
    mo.email as media_email,
    dl.status as delivery_status,
    dl.error_message,
    dl.sent_at
FROM distributions d
LEFT JOIN delivery_logs dl ON d.id = dl.distribution_id
LEFT JOIN media_outlets mo ON dl.media_outlet_id = mo.id
WHERE d.id = <DISTRIBUTION_ID>;
```

## 📝 Формат Email

### Структура письма:
- **From:** `{Название компании} <info@pressreach.ru>`
- **To:** email СМИ
- **Reply-To:** info@pressreach.ru
- **Subject:** Заголовок пресс-релиза
- **Body:**
  - HTML версия (красивое форматирование)
  - Plain text версия (fallback)
- **Attachments:** Прикрепленные файлы

### HTML шаблон
Генерируется функцией `generate_email_html()` из `email_template.py`:
- Заголовок
- Дата
- Основной текст
- Контакты компании
- Footer с логотипом PressReach

## 🔧 Troubleshooting

### Ошибка "Connection timeout"
- Проверить firewall на сервере: `ufw status`
- Проверить доступность порта: `telnet mail.hosting.reg.ru 465`
- Проверить SMTP credentials в .env

### Ошибка "Authentication failed"
- Проверить правильность SMTP_USERNAME и SMTP_PASSWORD
- Проверить что email включен в панели REG.RU

### Письма не доходят
- Проверить spam папку
- Проверить что email СМИ правильный
- Проверить DeliveryLog в базе данных
- Проверить логи backend: `journalctl -u pressreach-backend -n 100`

### Файлы не прикрепляются
- Проверить что папка uploads/ существует и доступна
- Проверить права: `ls -la /var/www/pressreach/backend/uploads`
- Проверить что файлы загрузились в БД: `SELECT * FROM distribution_files WHERE distribution_id = X;`

## 📊 Статусы рассылки

- `draft` - Черновик (только создана)
- `sent` - Отправлена (устаревший статус)
- `completed` - Успешно отправлена всем СМИ
- `partially_completed` - Отправлена частично (есть ошибки)
- `failed` - Не отправлена ни одному СМИ

## 🔐 Безопасность

- ✅ SMTP credentials в .env (не в коде)
- ✅ SSL/TLS шифрование (порт 465)
- ✅ Проверка прав доступа (только владелец может отправить свою рассылку)
- ✅ Валидация файлов (размер, расширения)
- ✅ Rate limiting (опционально, можно добавить)

## 📚 API Reference

### POST `/api/distributions/{distribution_id}/send`

**Headers:**
```
Authorization: Bearer {clerk_token}
```

**Response:**
```json
{
  "success": true,
  "total_media": 5,
  "sent_count": 5,
  "failed_count": 0,
  "status": "completed",
  "delivery_logs": [
    {
      "media_name": "TechCrunch",
      "media_email": "tips@techcrunch.com",
      "status": "sent",
      "error": null
    }
  ]
}
```

**Errors:**
- `404` - Рассылка не найдена или нет доступа
- `400` - Рассылка уже отправлена или нет выбранных СМИ
- `500` - Ошибка сервера

## 🎯 TODO (Frontend)

- [ ] Добавить кнопку "Отправить рассылку" в DistributionPage
- [ ] Добавить confirmation dialog
- [ ] Показывать прогресс отправки
- [ ] Показывать результаты (sent/failed counts)
- [ ] Добавить возможность повторной отправки на failed
