"""
Тестирование функции отправки email (симуляция без реального SMTP)
"""
import asyncio
import sys
from pathlib import Path

# Добавляем путь для импортов
sys.path.append(str(Path(__file__).parent))

from press_email_service import PressReleaseEmailService


async def test_email_sending():
    """Тест отправки email с симуляцией"""

    print("=" * 60)
    print("🧪 ТЕСТ EMAIL СЕРВИСА")
    print("=" * 60)

    # Создаем тестовый сервис
    email_service = PressReleaseEmailService()

    print(f"\n📧 Конфигурация:")
    print(f"   SMTP: {email_service.smtp_server}:{email_service.smtp_port}")
    print(f"   From: {email_service.from_email}")
    print(f"   From Name: {email_service.from_name}")

    # Тестовые данные
    test_data = {
        "to_email": "kostya.chuk@yandex.ru",
        "subject": "Тестовый пресс-релиз: Запуск нового продукта",
        "html_content": """
            <html>
                <body>
                    <h1>Компания XYZ запускает новый продукт</h1>
                    <p>Москва, 30 октября 2024 г. - Компания XYZ объявляет о запуске нового продукта.</p>
                    <p><strong>О компании:</strong> XYZ - лидер в области технологий.</p>
                    <hr>
                    <p style="font-size: 12px; color: gray;">
                        Контакты для СМИ:<br>
                        info@pressreach.ru
                    </p>
                </body>
            </html>
        """,
        "text_content": """
Компания XYZ запускает новый продукт

Москва, 30 октября 2024 г. - Компания XYZ объявляет о запуске нового продукта.

О компании: XYZ - лидер в области технологий.

---
Контакты для СМИ:
info@pressreach.ru
        """,
        "attachments": [],
        "company_name": "Компания XYZ"
    }

    print(f"\n📝 Тестовые данные:")
    print(f"   To: {test_data['to_email']}")
    print(f"   Subject: {test_data['subject']}")
    print(f"   Company: {test_data['company_name']}")
    print(f"   Attachments: {len(test_data['attachments'])}")

    print(f"\n🔍 Проверка SMTP подключения...")
    smtp_ok = await email_service.test_connection()

    if smtp_ok:
        print(f"✅ SMTP подключение работает")

        print(f"\n📤 Отправка тестового email...")
        result = await email_service.send_press_release(
            to_email=test_data["to_email"],
            subject=test_data["subject"],
            html_content=test_data["html_content"],
            text_content=test_data["text_content"],
            attachments=test_data["attachments"],
            company_name=test_data["company_name"]
        )

        if result:
            print(f"✅ Email успешно отправлен!")
        else:
            print(f"❌ Ошибка отправки email")
    else:
        print(f"⚠️  SMTP подключение не работает")
        print(f"   Возможные причины:")
        print(f"   - Нет доступа к SMTP серверу из локальной сети")
        print(f"   - Неверные credentials")
        print(f"   - Firewall блокирует порт 465")
        print(f"\n💡 Рекомендация:")
        print(f"   Протестируйте на production сервере, где SMTP доступен")

    print(f"\n" + "=" * 60)
    print(f"🏁 ТЕСТ ЗАВЕРШЕН")
    print(f"=" * 60)


if __name__ == "__main__":
    asyncio.run(test_email_sending())
