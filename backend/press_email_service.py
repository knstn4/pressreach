"""
Сервис для отправки пресс-релизов по email через SMTP
"""
import os
import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional, List
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class PressReleaseEmailService:
    """Сервис для отправки пресс-релизов по email"""

    def __init__(self):
        # SMTP настройки для info@pressreach.ru
        self.smtp_server = os.getenv("SMTP_SERVER", "mail.hosting.reg.ru")
        self.smtp_port = int(os.getenv("SMTP_PORT", "465"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "info@pressreach.ru")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "danmyj-winHoq-6nagby")
        self.from_email = os.getenv("FROM_EMAIL", "info@pressreach.ru")
        self.from_name = os.getenv("FROM_NAME", "PressReach")

    async def send_press_release(
            self,
            to_email: str,
            subject: str,
            html_content: str,
            text_content: str,
            attachments: Optional[List[str]] = None,
            company_name: Optional[str] = None
    ) -> bool:
        """
        Отправка пресс-релиза через SMTP с вложениями

        Args:
            to_email: Email получателя (СМИ)
            subject: Тема письма (заголовок пресс-релиза)
            html_content: HTML версия пресс-релиза
            text_content: Текстовая версия пресс-релиза
            attachments: Список путей к файлам для прикрепления
            company_name: Название компании (для красивого отображения From)

        Returns:
            bool: True если отправка успешна, False если ошибка
        """
        try:
            # Создаем сообщение
            message = MIMEMultipart("alternative")
            message["Subject"] = subject

            # Устанавливаем красивое имя отправителя
            if company_name:
                message["From"] = f"{company_name} <{self.from_email}>"
            else:
                message["From"] = f"{self.from_name} <{self.from_email}>"

            message["To"] = to_email
            message["Reply-To"] = self.from_email

            # Добавляем текстовую версию
            text_part = MIMEText(text_content, "plain", "utf-8")
            message.attach(text_part)

            # Добавляем HTML версию
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)

            # Добавляем вложения (файлы пресс-релиза)
            if attachments:
                for file_path in attachments:
                    file_path_obj = Path(file_path)
                    if file_path_obj.is_file():
                        try:
                            with open(file_path, "rb") as attachment_file:
                                part = MIMEBase("application", "octet-stream")
                                part.set_payload(attachment_file.read())

                            encoders.encode_base64(part)
                            part.add_header(
                                "Content-Disposition",
                                f"attachment; filename={file_path_obj.name}",
                            )
                            message.attach(part)
                            logger.info(f"📎 Прикреплен файл: {file_path_obj.name}")
                        except Exception as e:
                            logger.error(f"❌ Ошибка прикрепления файла {file_path}: {str(e)}")

            # Отправляем email
            # Для порта 465 используем use_tls=True (SSL)
            # Для портов 587/25 используем start_tls=True (STARTTLS)
            use_tls = self.smtp_port == 465
            start_tls = self.smtp_port in [587, 25]

            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                use_tls=use_tls,
                start_tls=start_tls,
                username=self.smtp_username,
                password=self.smtp_password,
                timeout=60,  # Увеличенный таймаут для больших файлов
            )

            logger.info(f"✅ Пресс-релиз успешно отправлен на {to_email}")
            return True

        except aiosmtplib.SMTPException as e:
            logger.error(f"❌ SMTP ошибка при отправке на {to_email}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"❌ Ошибка отправки пресс-релиза на {to_email}: {str(e)}")
            return False

    async def test_connection(self) -> bool:
        """
        Проверка подключения к SMTP серверу

        Returns:
            bool: True если подключение успешно
        """
        try:
            logger.info(f"🔍 Подключение к SMTP: {self.smtp_server}:{self.smtp_port}")
            logger.info(f"   Username: {self.smtp_username}")

            use_tls = self.smtp_port == 465
            start_tls = self.smtp_port in [587, 25]

            async with aiosmtplib.SMTP(
                hostname=self.smtp_server,
                port=self.smtp_port,
                use_tls=use_tls,
                timeout=30
            ) as smtp:
                if start_tls:
                    await smtp.starttls()
                await smtp.login(self.smtp_username, self.smtp_password)
                logger.info("✅ SMTP подключение успешно")
                return True
        except Exception as e:
            logger.error(f"❌ Ошибка подключения к SMTP: {str(e)}")
            logger.error(f"   Сервер: {self.smtp_server}:{self.smtp_port}")
            logger.error(f"   Username: {self.smtp_username}")
            return False
# Глобальный экземпляр сервиса
press_email_service = PressReleaseEmailService()
