"""
Скрипт для заполнения базы данных тестовыми данными СМИ
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, Category, MediaOutlet, MediaType, init_db

def seed_database():
    """Заполнить БД тестовыми данными"""

    # Инициализируем БД
    init_db()

    db = SessionLocal()

    try:
        # Создаем категории
        categories_data = [
            {"name": "Технологии и IT", "slug": "tech", "description": "СМИ, специализирующиеся на технологиях, IT и инновациях"},
            {"name": "Бизнес и Финансы", "slug": "business", "description": "Деловые издания и финансовая пресса"},
            {"name": "Стартапы", "slug": "startups", "description": "Издания о стартапах и предпринимательстве"},
            {"name": "Маркетинг", "slug": "marketing", "description": "Маркетинговые и рекламные издания"},
            {"name": "Общие новости", "slug": "general", "description": "Общие новостные издания"},
            {"name": "Отраслевые", "slug": "industry", "description": "Отраслевые специализированные издания"},
        ]

        categories = {}
        for cat_data in categories_data:
            existing = db.query(Category).filter_by(slug=cat_data["slug"]).first()
            if not existing:
                cat = Category(**cat_data)
                db.add(cat)
                db.flush()
                categories[cat_data["slug"]] = cat
            else:
                categories[cat_data["slug"]] = existing

        db.commit()
        print(f"✓ Создано {len(categories_data)} категорий")

        # Создаем СМИ
        media_data = [
            # Технологические СМИ
            {
                "name": "VC.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://vc.ru",
                "email": "tips@vc.ru",
                "audience_size": 2000000,
                "monthly_reach": 5000000,
                "base_price": 5000.0,
                "priority_multiplier": 1.5,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["tech", "business", "startups"]
            },
            {
                "name": "Habr",
                "media_type": MediaType.ONLINE,
                "website": "https://habr.com",
                "email": "press@habr.com",
                "audience_size": 3000000,
                "monthly_reach": 8000000,
                "base_price": 4000.0,
                "priority_multiplier": 1.4,
                "is_premium": True,
                "rating": 4.7,
                "categories": ["tech"]
            },
            {
                "name": "RB.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://rb.ru",
                "email": "editor@rb.ru",
                "audience_size": 1500000,
                "monthly_reach": 3000000,
                "base_price": 3500.0,
                "priority_multiplier": 1.3,
                "is_premium": True,
                "rating": 4.5,
                "categories": ["business", "startups"]
            },

            # Деловые СМИ
            {
                "name": "РБК",
                "media_type": MediaType.ONLINE,
                "website": "https://rbc.ru",
                "email": "news@rbc.ru",
                "audience_size": 10000000,
                "monthly_reach": 25000000,
                "base_price": 8000.0,
                "priority_multiplier": 2.0,
                "is_premium": True,
                "rating": 4.9,
                "categories": ["business", "general"]
            },
            {
                "name": "Ведомости",
                "media_type": MediaType.NEWSPAPER,
                "website": "https://vedomosti.ru",
                "email": "info@vedomosti.ru",
                "audience_size": 5000000,
                "monthly_reach": 12000000,
                "base_price": 7000.0,
                "priority_multiplier": 1.8,
                "is_premium": True,
                "rating": 4.7,
                "categories": ["business"]
            },
            {
                "name": "Коммерсантъ",
                "media_type": MediaType.NEWSPAPER,
                "website": "https://kommersant.ru",
                "email": "redakciya@kommersant.ru",
                "audience_size": 4000000,
                "monthly_reach": 10000000,
                "base_price": 7500.0,
                "priority_multiplier": 1.9,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["business", "general"]
            },

            # Стартап-издания
            {
                "name": "Rusbase",
                "media_type": MediaType.ONLINE,
                "website": "https://rusbase.com",
                "email": "hello@rusbase.com",
                "telegram_username": "@rusbase",
                "audience_size": 800000,
                "monthly_reach": 2000000,
                "base_price": 3000.0,
                "priority_multiplier": 1.2,
                "rating": 4.4,
                "categories": ["tech", "startups", "business"]
            },
            {
                "name": "Forbes Russia",
                "media_type": MediaType.MAGAZINE,
                "website": "https://forbes.ru",
                "email": "info@forbes.ru",
                "audience_size": 6000000,
                "monthly_reach": 15000000,
                "base_price": 9000.0,
                "priority_multiplier": 2.2,
                "is_premium": True,
                "rating": 4.9,
                "categories": ["business", "general"]
            },

            # Маркетинговые издания
            {
                "name": "Sostav.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://sostav.ru",
                "email": "news@sostav.ru",
                "audience_size": 500000,
                "monthly_reach": 1200000,
                "base_price": 2500.0,
                "rating": 4.2,
                "categories": ["marketing", "business"]
            },
            {
                "name": "Cossa",
                "media_type": MediaType.ONLINE,
                "website": "https://www.cossa.ru",
                "email": "editor@cossa.ru",
                "audience_size": 400000,
                "monthly_reach": 1000000,
                "base_price": 2000.0,
                "rating": 4.1,
                "categories": ["marketing", "tech"]
            },

            # Общие новостные издания
            {
                "name": "ТАСС",
                "media_type": MediaType.AGENCY,
                "website": "https://tass.ru",
                "email": "info@tass.ru",
                "audience_size": 15000000,
                "monthly_reach": 40000000,
                "base_price": 10000.0,
                "priority_multiplier": 2.5,
                "is_premium": True,
                "rating": 4.9,
                "categories": ["general"]
            },
            {
                "name": "Интерфакс",
                "media_type": MediaType.AGENCY,
                "website": "https://interfax.ru",
                "email": "pr@interfax.ru",
                "audience_size": 12000000,
                "monthly_reach": 35000000,
                "base_price": 9500.0,
                "priority_multiplier": 2.4,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["general", "business"]
            },

            # Дополнительные IT-издания
            {
                "name": "CNews",
                "media_type": MediaType.ONLINE,
                "website": "https://cnews.ru",
                "email": "info@cnews.ru",
                "audience_size": 1000000,
                "monthly_reach": 2500000,
                "base_price": 3000.0,
                "rating": 4.3,
                "categories": ["tech", "business"]
            },
            {
                "name": "Securitylab",
                "media_type": MediaType.ONLINE,
                "website": "https://www.securitylab.ru",
                "email": "editor@securitylab.ru",
                "audience_size": 600000,
                "monthly_reach": 1500000,
                "base_price": 2500.0,
                "rating": 4.2,
                "categories": ["tech"]
            },
            {
                "name": "Roem.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://roem.ru",
                "email": "info@roem.ru",
                "telegram_username": "@roemru",
                "audience_size": 500000,
                "monthly_reach": 1200000,
                "base_price": 2000.0,
                "rating": 4.1,
                "categories": ["tech", "startups"]
            }
        ]

        for media_info in media_data:
            # Извлекаем категории
            cat_slugs = media_info.pop("categories", [])

            # Проверяем, существует ли СМИ
            existing = db.query(MediaOutlet).filter_by(name=media_info["name"]).first()
            if not existing:
                media = MediaOutlet(**media_info)

                # Добавляем категории
                for slug in cat_slugs:
                    if slug in categories:
                        media.categories.append(categories[slug])

                db.add(media)
            else:
                print(f"  СМИ '{media_info['name']}' уже существует, пропускаем...")

        db.commit()
        print(f"✓ Создано {len(media_data)} СМИ")
        print("\n✅ База данных успешно заполнена!")

    except Exception as e:
        print(f"❌ Ошибка при заполнении БД: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
