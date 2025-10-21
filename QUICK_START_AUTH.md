# ✅ Быстрая инструкция по настройке Clerk

## Шаг 1: Регистрация в Clerk (5 минут)

1. Перейдите на https://clerk.com/
2. Нажмите "Start building for free"
3. Войдите через GitHub или email
4. Создайте новое приложение "PressReach"
5. Выберите способы входа: Email + Google (рекомендуется)

## Шаг 2: Получите ключ (1 минута)

1. После создания приложения вы увидите экран с ключами
2. Скопируйте **Publishable key** (начинается с `pk_test_...`)

## Шаг 3: Добавьте ключ в проект (1 минута)

1. Откройте файл `/front/.env.local`
2. Вставьте ваш ключ:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ваш_ключ
```

## Шаг 4: Настройте URLs в Clerk (2 минуты)

В Clerk Dashboard → Paths → URL:
- Sign in URL: `/sign-in`
- Sign up URL: `/sign-up`
- After sign in: `/dashboard`
- After sign up: `/dashboard`
- Home URL: `/`

В "Allowed redirect URLs" добавьте:
- `http://localhost:5173`

## Шаг 5: Перезапустите сервер

```bash
cd front
# Остановите текущий сервер (Ctrl+C)
npm run dev
```

## Шаг 6: Проверьте

1. Откройте http://localhost:5173
2. Нажмите "Начать" в шапке
3. Зарегистрируйтесь
4. Вы попадёте в личный кабинет!

---

**Готово! Теперь у вас работает авторизация** 🎉

Подробные инструкции: см. файл `CLERK_SETUP.md`
