from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Table, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import enum
import os
from dotenv import load_dotenv

load_dotenv()

# Создаем базовый класс для моделей
Base = declarative_base()

# Таблица связи многие-ко-многим для СМИ и категорий
media_categories = Table(
    'media_categories',
    Base.metadata,
    Column('media_id', Integer, ForeignKey('media_outlets.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

# Таблица связи для выбранных СМИ в рассылке
distribution_media = Table(
    'distribution_media',
    Base.metadata,
    Column('distribution_id', Integer, ForeignKey('distributions.id'), primary_key=True),
    Column('media_id', Integer, ForeignKey('media_outlets.id'), primary_key=True)
)


class PlanType(enum.Enum):
    """Тип тарифного плана"""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class MediaType(enum.Enum):
    """Тип СМИ"""
    NEWSPAPER = "newspaper"  # Газета
    MAGAZINE = "magazine"  # Журнал
    ONLINE = "online"  # Онлайн-издание
    TV = "tv"  # Телевидение
    RADIO = "radio"  # Радио
    AGENCY = "agency"  # Информационное агентство
    BLOG = "blog"  # Блог


class ContactType(enum.Enum):
    """Тип контакта"""
    EMAIL = "email"
    TELEGRAM = "telegram"
    PHONE = "phone"
    WHATSAPP = "whatsapp"


class Category(Base):
    """Категория СМИ"""
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)  # Например: "Технологии", "Бизнес"
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    media_outlets = relationship('MediaOutlet', secondary=media_categories, back_populates='categories')

    def __repr__(self):
        return f"<Category {self.name}>"


class User(Base):
    """Модель пользователя"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    clerk_user_id = Column(String(255), unique=True, nullable=False, index=True)  # ID из Clerk
    email = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))

    # Подписка и лимиты
    plan_type = Column(SQLEnum(PlanType), default=PlanType.FREE)
    credits = Column(Integer, default=100)  # Кредиты для рассылки
    monthly_releases_limit = Column(Integer, default=3)  # Лимит релизов в месяц

    # Статистика
    total_releases = Column(Integer, default=0)
    total_distributions = Column(Integer, default=0)

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

    # Связи
    distributions = relationship('Distribution', back_populates='user')
    branding = relationship('UserBranding', back_populates='user', uselist=False)

    def __repr__(self):
        return f"<User {self.email}>"


class UserBranding(Base):
    """Модель настроек брендинга пользователя"""
    __tablename__ = 'user_branding'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)

    # Логотип и визуал
    logo_url = Column(String(500))  # URL загруженного логотипа
    primary_color = Column(String(7), default='#3B82F6')  # Основной цвет (hex)
    secondary_color = Column(String(7), default='#8B5CF6')  # Дополнительный цвет (hex)
    accent_color = Column(String(7), default='#10B981')  # Акцентный цвет (hex)

    # Информация о компании
    company_name = Column(String(255))
    company_tagline = Column(String(500))  # Слоган
    company_description = Column(Text)

    # Контакты
    contact_person = Column(String(255))  # Контактное лицо
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    website = Column(String(500))
    address = Column(Text)

    # Социальные сети
    linkedin_url = Column(String(500))
    twitter_url = Column(String(500))
    facebook_url = Column(String(500))
    instagram_url = Column(String(500))
    youtube_url = Column(String(500))
    telegram_url = Column(String(500))

    # Шаблоны подписи
    email_signature = Column(Text)  # HTML-подпись для email
    default_closing = Column(Text, default='С уважением')  # Заключительная фраза

    # Настройки шаблона письма
    email_template_style = Column(String(50), default='modern')  # modern, classic, minimal
    show_logo_in_header = Column(Boolean, default=True)
    show_social_links = Column(Boolean, default=True)
    footer_text = Column(Text)  # Дополнительный текст в футере

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    user = relationship('User', back_populates='branding')

    def __repr__(self):
        return f"<UserBranding user_id={self.user_id}>"


class MediaOutlet(Base):
    """Модель СМИ"""
    __tablename__ = 'media_outlets'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)  # Название СМИ
    media_type = Column(SQLEnum(MediaType), nullable=False)
    website = Column(String(500))
    description = Column(Text)

    # Контактная информация
    email = Column(String(255))
    telegram_username = Column(String(100))
    phone = Column(String(50))
    whatsapp = Column(String(50))

    # Аудитория и охват
    audience_size = Column(Integer)  # Размер аудитории
    monthly_reach = Column(Integer)  # Месячный охват

    # Ценообразование
    base_price = Column(Float, default=0.0)  # Базовая цена за рассылку
    priority_multiplier = Column(Float, default=1.0)  # Множитель для приоритетных СМИ

    # Статус и рейтинг
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)  # Рейтинг от 0 до 5

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отслеживание авторства
    added_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    added_by_name = Column(String(255), nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    categories = relationship('Category', secondary=media_categories, back_populates='media_outlets')
    distributions = relationship('Distribution', secondary=distribution_media, back_populates='distributions')

    def __repr__(self):
        return f"<MediaOutlet {self.name}>"

    def calculate_price(self) -> float:
        """Рассчитать стоимость рассылки в это СМИ"""
        price = self.base_price * self.priority_multiplier
        if self.is_premium:
            price *= 1.5
        return round(price, 2)


class Distribution(Base):
    """Модель рассылки пресс-релиза"""
    __tablename__ = 'distributions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)  # Связь с пользователем

    # Информация о пресс-релизе
    press_release_title = Column(String(500), nullable=False)
    press_release_content = Column(Text, nullable=False)
    press_release_data = Column(Text)  # JSON с полными данными пресс-релиза

    # Информация о компании
    company_name = Column(String(255), nullable=False)
    contact_email = Column(String(255))
    contact_phone = Column(String(50))

    # Параметры рассылки
    scheduled_at = Column(DateTime)  # Время запланированной рассылки
    sent_at = Column(DateTime)  # Время фактической отправки
    status = Column(String(50), default='pending')  # pending, processing, completed, failed

    # Статистика
    total_media_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)

    # Ценообразование
    total_price = Column(Float, default=0.0)

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    user = relationship('User', back_populates='distributions')
    media_outlets = relationship('MediaOutlet', secondary=distribution_media, back_populates='distributions')
    delivery_logs = relationship('DeliveryLog', back_populates='distribution', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Distribution {self.id}: {self.press_release_title[:50]}>"


class DistributionFile(Base):
    """Модель файлов, прикреплённых к рассылке"""
    __tablename__ = 'distribution_files'

    id = Column(Integer, primary_key=True)
    distribution_id = Column(Integer, ForeignKey('distributions.id'), nullable=False)

    # Информация о файле
    file_name = Column(String(255), nullable=False)  # Оригинальное имя файла
    file_path = Column(String(500), nullable=False)  # Путь к файлу на сервере
    file_size = Column(Integer, nullable=False)  # Размер в байтах
    file_type = Column(String(100))  # MIME type (image/png, application/pdf и т.д.)

    # Метаданные
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Связь
    distribution = relationship('Distribution', backref='files')

    def __repr__(self):
        return f"<DistributionFile {self.id}: {self.file_name}>"


class DeliveryLog(Base):
    """Лог доставки пресс-релиза в конкретное СМИ"""
    __tablename__ = 'delivery_logs'

    id = Column(Integer, primary_key=True)
    distribution_id = Column(Integer, ForeignKey('distributions.id'), nullable=False)
    media_outlet_id = Column(Integer, ForeignKey('media_outlets.id'), nullable=False)

    # Информация о доставке
    contact_type = Column(SQLEnum(ContactType), nullable=False)
    contact_value = Column(String(255), nullable=False)  # Email, Telegram username и т.д.

    # Статус
    status = Column(String(50), default='pending')  # pending, sent, delivered, failed, bounced
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)

    # Детали
    error_message = Column(Text)
    response_data = Column(Text)  # JSON с ответом от сервиса доставки

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    distribution = relationship('Distribution', back_populates='delivery_logs')
    media_outlet = relationship('MediaOutlet')

    def __repr__(self):
        return f"<DeliveryLog {self.id}: {self.status}>"


# Настройка подключения к БД
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://localhost:5432/pressreach'
)

# Создаем движок и сессию
# echo=False - отключаем SQL логи (установите True для отладки)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Инициализация базы данных"""
    Base.metadata.create_all(bind=engine)
    print("База данных инициализирована!")


def get_db():
    """Получить сессию БД для использования в FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    # Создать все таблицы
    init_db()
