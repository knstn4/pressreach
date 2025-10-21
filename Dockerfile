# Dockerfile для PressReach
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы требований
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY backend/ ./backend/
COPY .env .

# Открываем порт
EXPOSE 8000

# Команда запуска
CMD ["python3", "backend/main.py"]