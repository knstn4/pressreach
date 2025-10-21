# 🔐 Настройка авторизации через Clerk

## ✅ Что уже сделано:

1. ✅ Установлен `@clerk/clerk-react`
2. ✅ Создана страница Dashboard (личный кабинет)
3. ✅ Созданы страницы SignIn и SignUp
4. ✅ Настроена защита роутов (ProtectedRoute)
5. ✅ Обновлен Navbar с кнопками входа/выхода
6. ✅ Интегрирован ClerkProvider в App.tsx

## 📋 Что нужно сделать вам:

### 1. Зарегистрируйтесь в Clerk

1. Перейдите на https://clerk.com/
2. Нажмите "Start building for free"
3. Войдите через GitHub (или email)

### 2. Создайте новое приложение

1. В dashboard нажмите "+ Create application"
2. Название: `PressReach` (или любое другое)
3. Выберите способы входа:
   - ✅ Email (обязательно)
   - ✅ Google (рекомендуется)
   - ✅ GitHub (опционально)
4. Нажмите "Create application"

### 3. Получите Publishable Key

1. После создания приложения откроется страница с ключами
2. Скопируйте **Publishable key** (начинается с `pk_test_...`)
3. Откройте файл `/front/.env.local`
4. Замените `your_clerk_publishable_key_here` на ваш ключ:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ваш_ключ_здесь
```

### 4. Настройте URL в Clerk Dashboard

1. В Clerk Dashboard перейдите в "Paths"
2. Настройте следующие пути:
   - **Sign in URL**: `/sign-in`
   - **Sign up URL**: `/sign-up`
   - **After sign in URL**: `/dashboard`
   - **After sign up URL**: `/dashboard`
   - **Home URL**: `/`

3. В разделе "Allowed redirect URLs" добавьте:
   - `http://localhost:5173`
   - `http://localhost:5173/dashboard`

### 5. Перезапустите dev-сервер

```bash
cd front
npm run dev
```

### 6. Проверьте работу

1. Откройте http://localhost:5173
2. Нажмите "Начать" или "Войти" в навигации
3. Зарегистрируйтесь / Войдите
4. Вы должны попасть в личный кабинет `/dashboard`

## 🎨 Созданные страницы:

### `/dashboard` - Личный кабинет
- Статистика пользователя (релизы, рассылки, кредиты)
- Последние пресс-релизы
- История активности
- Быстрые действия
- Информация о тарифе

### `/sign-in` - Вход
- Форма входа через email
- OAuth (Google, GitHub если включены)
- Ссылка на регистрацию

### `/sign-up` - Регистрация
- Форма регистрации
- OAuth провайдеры
- Ссылка на вход

## 🔒 Защищённые маршруты:

Все основные страницы теперь требуют авторизации:
- `/dashboard` - личный кабинет
- `/generator` - генератор релизов
- `/improve-text` - улучшение текста
- `/distribution` - рассылка
- `/media-management` - база СМИ

Неавторизованные пользователи будут перенаправлены на `/sign-in`

## 🎯 Дополнительные возможности Clerk:

### Кастомизация внешнего вида

В Clerk Dashboard → "Customization" → "Theme":
- Настройте цвета под ваш бренд
- Загрузите логотип
- Измените шрифты

### Email уведомления

В "Emails" настройте:
- Приветственные письма
- Подтверждение email
- Сброс пароля
- Кастомные шаблоны

### Дополнительные поля профиля

В "User & Authentication" → "Email, Phone, Username":
- Добавьте телефон
- Включите username
- Настройте обязательность полей

### Организации (для будущего)

Если планируете командную работу:
1. Включите "Organizations" в настройках
2. Пользователи смогут создавать команды
3. Разграничение доступа внутри команды

## 🚀 Следующие шаги:

### Интеграция с бэкендом

Вам нужно будет:

1. **Добавить Clerk в бэкенд** (FastAPI):

```bash
cd backend
pip install clerk-backend-api
```

2. **Создать middleware для проверки токенов**:

```python
from clerk_backend_api import Clerk

clerk = Clerk(bearer_auth="your_clerk_secret_key")

async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    try:
        user = clerk.verify_token(token)
        return user
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")
```

3. **Получить Secret Key**:
   - В Clerk Dashboard → "API Keys"
   - Скопируйте "Secret key"
   - Добавьте в `.env` бэкенда

4. **Защитить API endpoints**:

```python
@app.get("/api/user/stats")
async def get_user_stats(user = Depends(get_current_user)):
    # Теперь можете использовать user.id
    return {"user_id": user.id}
```

### Сохранение данных пользователя

Создайте таблицу `users` в PostgreSQL:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    plan_name VARCHAR(50) DEFAULT 'free',
    credits INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

При первом входе создавайте запись:

```python
@app.post("/api/user/sync")
async def sync_user(user = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.clerk_user_id == user.id).first()
    if not existing:
        new_user = User(
            clerk_user_id=user.id,
            email=user.email_addresses[0].email_address,
            first_name=user.first_name,
            last_name=user.last_name
        )
        db.add(new_user)
        db.commit()
    return {"status": "synced"}
```

## 💡 Советы:

1. **Тестирование**: Создайте несколько тестовых аккаунтов с разными email
2. **Безопасность**: Никогда не коммитьте `.env.local` в Git
3. **Production**: Перед деплоем смените ключи на production ключи (`pk_live_...`)
4. **Webhooks**: Настройте webhooks в Clerk для синхронизации данных при изменении профиля

## 🐛 Возможные проблемы:

### "Missing Clerk Publishable Key"
➡️ Проверьте, что `.env.local` создан и содержит правильный ключ

### "Invalid publishable key"
➡️ Убедитесь, что скопировали Publishable Key, а не Secret Key

### Редирект не работает
➡️ Проверьте настройки Paths в Clerk Dashboard

### Стили формы выглядят странно
➡️ Настройте theme в Clerk Dashboard → Customization

## 📞 Поддержка:

- Документация Clerk: https://clerk.com/docs
- Discord: https://clerk.com/discord
- GitHub Issues: https://github.com/clerk/javascript

---

**Готово!** После настройки у вас будет полноценная авторизация с красивым личным кабинетом 🎉
