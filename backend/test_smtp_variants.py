"""
Тестирование разных вариантов подключения к SMTP REG.RU
"""
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


async def test_smtp_config(server, port, use_tls, start_tls, username, password):
    """Тест конкретной конфигурации SMTP"""
    config_name = f"{server}:{port} (TLS={use_tls}, STARTTLS={start_tls})"
    print(f"\n{'='*60}")
    print(f"🧪 Тестирую: {config_name}")
    print(f"{'='*60}")

    try:
        # Создаем тестовое сообщение
        message = MIMEMultipart()
        message["From"] = "info@pressreach.ru"
        message["To"] = "kostya.chuk@yandex.ru"
        message["Subject"] = "Test"
        message.attach(MIMEText("Test message", "plain"))

        print(f"📡 Подключаюсь к {server}:{port}...")

        # Пробуем подключиться
        async with aiosmtplib.SMTP(
            hostname=server,
            port=port,
            use_tls=use_tls,
            timeout=10
        ) as smtp:
            print("✅ Подключение установлено")

            if start_tls and not use_tls:
                print("🔐 Включаю STARTTLS...")
                await smtp.starttls()
                print("✅ STARTTLS активирован")

            print(f"🔑 Авторизация как {username}...")
            await smtp.login(username, password)
            print("✅ Авторизация успешна")

            print("📧 Отправляю тестовое письмо...")
            await smtp.send_message(message)
            print("✅ Письмо отправлено!")

            return True

    except asyncio.TimeoutError:
        print(f"❌ Timeout - сервер не отвечает")
        return False
    except aiosmtplib.SMTPAuthenticationError as e:
        print(f"❌ Ошибка авторизации: {e}")
        return False
    except aiosmtplib.SMTPException as e:
        print(f"❌ SMTP ошибка: {e}")
        return False
    except Exception as e:
        print(f"❌ Ошибка: {type(e).__name__}: {e}")
        return False


async def main():
    username = "info@pressreach.ru"
    password = "danmyj-winHoq-6nagby"

    print("="*60)
    print("🧪 ТЕСТИРОВАНИЕ SMTP КОНФИГУРАЦИЙ REG.RU")
    print("="*60)

    # Варианты конфигураций для REG.RU
    configs = [
        # Вариант 1: mail.hosting.reg.ru:465 с SSL
        {
            "name": "mail.hosting.reg.ru:465 (SSL)",
            "server": "mail.hosting.reg.ru",
            "port": 465,
            "use_tls": True,
            "start_tls": False
        },
        # Вариант 2: mail.hosting.reg.ru:587 с STARTTLS
        {
            "name": "mail.hosting.reg.ru:587 (STARTTLS)",
            "server": "mail.hosting.reg.ru",
            "port": 587,
            "use_tls": False,
            "start_tls": True
        },
        # Вариант 3: mail.hosting.reg.ru:25 с STARTTLS
        {
            "name": "mail.hosting.reg.ru:25 (STARTTLS)",
            "server": "mail.hosting.reg.ru",
            "port": 25,
            "use_tls": False,
            "start_tls": True
        },
        # Вариант 4: smtp.reg.ru:465 с SSL
        {
            "name": "smtp.reg.ru:465 (SSL)",
            "server": "smtp.reg.ru",
            "port": 465,
            "use_tls": True,
            "start_tls": False
        },
        # Вариант 5: smtp.reg.ru:587 с STARTTLS
        {
            "name": "smtp.reg.ru:587 (STARTTLS)",
            "server": "smtp.reg.ru",
            "port": 587,
            "use_tls": False,
            "start_tls": True
        },
    ]

    results = []

    for config in configs:
        result = await test_smtp_config(
            server=config["server"],
            port=config["port"],
            use_tls=config["use_tls"],
            start_tls=config["start_tls"],
            username=username,
            password=password
        )
        results.append((config["name"], result))

        # Пауза между попытками
        await asyncio.sleep(2)

    # Итоги
    print("\n" + "="*60)
    print("📊 ИТОГИ ТЕСТИРОВАНИЯ")
    print("="*60)

    success_count = 0
    for name, success in results:
        status = "✅ РАБОТАЕТ" if success else "❌ НЕ РАБОТАЕТ"
        print(f"{status} - {name}")
        if success:
            success_count += 1

    print("="*60)
    print(f"✅ Успешных конфигураций: {success_count}/{len(results)}")
    print("="*60)

    if success_count > 0:
        print("\n💡 Рекомендация: Используйте одну из работающих конфигураций в .env")
    else:
        print("\n⚠️  Ни одна конфигурация не работает из локальной сети")
        print("   Возможные причины:")
        print("   - Firewall блокирует исходящие SMTP соединения")
        print("   - ISP блокирует SMTP порты (частая практика)")
        print("   - Требуется VPN или работа с production сервера")


if __name__ == "__main__":
    asyncio.run(main())
