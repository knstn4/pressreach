# PressReach Backend

Backend API для сервиса автоматизации пресс-релизов PressReach.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Создать виртуальное окружение (если ещё не создано)
python -m venv ../venv

# Активировать виртуальное окружение
source ../venv/bin/activate  # macOS/Linux
# или
../venv/Scripts/activate  # Windows

# Установить зависимости
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

**Обязательные переменные:**

```env
# API ключи
DEEPSEEK_API_KEY=your_deepseek_api_key

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pressreach
```

**Где взять ключи:**
- **DEEPSEEK_API_KEY**: https://openrouter.ai/keys
- **CLERK_SECRET_KEY**: https://dashboard.clerk.com → API Keys → Secret Keys

### 3. Настройка базы данных

```bash
# Создать базу данных PostgreSQL
createdb pressreach

# Или через psql
psql -U postgres
CREATE DATABASE pressreach;
\q

# Создать таблицы
python database.py

# Заполнить тестовыми данными (опционально)
python seed_database.py
```

### 4. Запуск сервера

```bash
# Development режим с автоперезагрузкой
uvicorn main:app --reload --port 8000

# Production режим
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API будет доступно на http://localhost:8000

## 📚 API Документация

После запуска сервера:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔑 Аутентификация

Backend использует Clerk JWT токены для аутентификации.

**Защищённые эндпоинты требуют заголовок:**
```
Authorization: Bearer <clerk_jwt_token>
```

**Получение токена на фронтенде:**
```javascript
const token = await getToken();
```

## 📁 Структура проекта

```
backend/
├── main.py              # FastAPI приложение и эндпоинты
├── database.py          # SQLAlchemy модели и настройка БД
├── clerk_auth.py        # Middleware для Clerk аутентификации
├── open_router_client.py # Клиент для OpenRouter API
├── prompts.py           # Промпты для AI генерации
├── seed_database.py     # Скрипт для заполнения БД
├── create_users_table.py # Создание таблицы users
├── requirements.txt     # Python зависимости
├── .env                 # Переменные окружения (не в git)
└── .env.example         # Пример переменных окружения
```

## 🛠 API Endpoints

### Публичные
- `GET /` - Проверка работы API
- `GET /health` - Health check
- `POST /generate-press-release` - Генерация пресс-релиза
- `POST /improve-text` - Улучшение текста

### Авторизация (требуют JWT токен)
- `POST /api/user/sync` - Синхронизация пользователя из Clerk
- `GET /api/user/stats` - Статистика пользователя

### Медиа и категории
- `GET /api/categories` - Список категорий СМИ
- `GET /api/media` - Список медиа-изданий
- `POST /api/media` - Создать СМИ
- `PUT /api/media/{id}` - Обновить СМИ
- `DELETE /api/media/{id}` - Удалить СМИ

### Рассылки
- `POST /api/distributions` - Создать рассылку
- `GET /api/distributions` - Список рассылок
- `GET /api/distributions/{id}` - Информация о рассылке
- `POST /api/calculate-price` - Рассчитать стоимость

## 🔒 Безопасность

### JWT Верификация
Backend проверяет JWT токены используя Clerk Secret Key:

```python
from clerk_auth import get_current_user

@app.get("/protected")
async def protected_route(user = Depends(get_current_user)):
    return {"user_id": user["sub"]}
```

### CORS
CORS настроен на принятие запросов от фронтенда:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В production укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🗄 База данных

### Модели

- **User** - Пользователи (связь с Clerk)
- **MediaOutlet** - СМИ и издания
- **Category** - Категории СМИ
- **Distribution** - Рассылки пресс-релизов
- **DeliveryLog** - Логи доставки

### Миграции

Для управления миграциями можно использовать Alembic:

```bash
# Инициализация
alembic init alembic

# Создать миграцию
alembic revision --autogenerate -m "Description"

# Применить миграции
alembic upgrade head
```

## 🐛 Отладка

### Проверить подключение к БД
```bash
python -c "from database import engine; print(engine.connect())"
```

### Проверить Clerk токен
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/user/stats
```

### Логи
Логи выводятся в консоль с уровнем INFO. Для детального логирования:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## ⚠️ Важные замечания

1. **CLERK_SECRET_KEY** - критически важен для безопасности. Никогда не коммитьте в git!
2. **DATABASE_URL** - убедитесь, что PostgreSQL запущен и доступен
3. **JWT верификация** - теперь включена полная проверка подписи (было отключено)
4. **CORS** - в production ограничьте `allow_origins` конкретными доменами

## 📝 TODO

- [ ] Настроить Alembic миграции
- [ ] Добавить rate limiting
- [ ] Реализовать отправку email через SMTP
- [ ] Интеграция с Telegram API
- [ ] Webhooks для Clerk
- [ ] Мониторинг и логирование (Sentry)
- [ ] Docker контейнеризация
- [ ] CI/CD пайплайн

## 🤝 Разработка

### Запуск тестов
```bash
pytest
```

### Форматирование кода
```bash
black .
isort .
```

### Проверка типов
```bash
mypy .
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения в `.env`
4. Проверьте подключение к PostgreSQL
