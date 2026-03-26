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
            {"name": "Маркетинг и PR", "slug": "marketing", "description": "Маркетинговые и рекламные издания"},
            {"name": "Общие новости", "slug": "general", "description": "Общефедеральные и общегородские новостные издания"},
            {"name": "Отраслевые", "slug": "industry", "description": "Отраслевые специализированные издания"},
            {"name": "Кибербезопасность", "slug": "security", "description": "Издания об информационной безопасности"},
            {"name": "Финтех", "slug": "fintech", "description": "Финансовые технологии, банкинг, крипто"},
            {"name": "Розничная торговля", "slug": "retail", "description": "Ритейл, e-commerce, потребительский рынок"},
            {"name": "Телекоммуникации", "slug": "telecom", "description": "Телеком, операторы связи, интернет-индустрия"},
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
        print(f"✓ Создано/обновлено {len(categories_data)} категорий")

        # Создаем СМИ
        media_data = [

            # ── Информационные агентства ──────────────────────────────────────
            {
                "name": "ТАСС",
                "media_type": MediaType.AGENCY,
                "website": "https://tass.ru",
                "description": "Крупнейшее федеральное информационное агентство России. Освещает события в политике, экономике, технологиях и обществе. Материалы агентства перепечатывают тысячи изданий по всему миру.",
                "email": "pr@tass.ru",
                "telegram_username": "@tass_agency",
                "audience_size": 15_000_000,
                "monthly_reach": 42_000_000,
                "base_price": 12_000.0,
                "priority_multiplier": 2.5,
                "is_premium": True,
                "rating": 4.9,
                "categories": ["general", "business"]
            },
            {
                "name": "Интерфакс",
                "media_type": MediaType.AGENCY,
                "website": "https://interfax.ru",
                "description": "Ведущее независимое информационное агентство. Ключевой источник новостей для деловой аудитории и профессиональных участников рынка. Особенно сильно в финансовой и корпоративной тематике.",
                "email": "pr@interfax.ru",
                "telegram_username": "@interfaxonline",
                "audience_size": 12_000_000,
                "monthly_reach": 35_000_000,
                "base_price": 11_000.0,
                "priority_multiplier": 2.4,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["general", "business", "fintech"]
            },
            {
                "name": "РИА Новости",
                "media_type": MediaType.AGENCY,
                "website": "https://ria.ru",
                "description": "Федеральное государственное информационное агентство. Один из крупнейших российских медиахолдингов. Широкая финансовая, технологическая и политическая повестка.",
                "email": "press@ria.ru",
                "telegram_username": "@rian_ru",
                "audience_size": 18_000_000,
                "monthly_reach": 48_000_000,
                "base_price": 13_000.0,
                "priority_multiplier": 2.6,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["general", "business"]
            },

            # ── Деловые издания ─────────────────────────────────────────────
            {
                "name": "РБК",
                "media_type": MediaType.ONLINE,
                "website": "https://rbc.ru",
                "description": "Ведущий деловой медиахолдинг России: онлайн-издание, телеканал, газета и журнал. Целевая аудитория — топ-менеджеры, предприниматели и инвесторы. Эффективная площадка для B2B и корпоративных новостей.",
                "email": "news@rbc.ru",
                "telegram_username": "@rbcnews",
                "audience_size": 10_000_000,
                "monthly_reach": 26_000_000,
                "base_price": 9_000.0,
                "priority_multiplier": 2.1,
                "is_premium": True,
                "rating": 4.9,
                "categories": ["business", "general", "fintech"]
            },
            {
                "name": "Ведомости",
                "media_type": MediaType.NEWSPAPER,
                "website": "https://vedomosti.ru",
                "description": "Ведущая российская деловая газета. Аудитория — руководители крупного и среднего бизнеса, чиновники, эксперты. Публикации в Ведомостях воспринимаются как подтверждение серьёзности компании.",
                "email": "info@vedomosti.ru",
                "telegram_username": "@vedomosti",
                "audience_size": 5_000_000,
                "monthly_reach": 12_500_000,
                "base_price": 8_000.0,
                "priority_multiplier": 1.9,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["business", "fintech"]
            },
            {
                "name": "Коммерсантъ",
                "media_type": MediaType.NEWSPAPER,
                "website": "https://kommersant.ru",
                "description": "Авторитетная деловая газета с 30-летней историей. Сильная редакционная аналитика, широкий охват корпоративной жизни и отраслевых событий. Идеальная площадка для новостей о сделках и партнёрствах.",
                "email": "pr@kommersant.ru",
                "telegram_username": "@kommersant",
                "audience_size": 4_200_000,
                "monthly_reach": 11_000_000,
                "base_price": 8_500.0,
                "priority_multiplier": 2.0,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["business", "general"]
            },
            {
                "name": "Forbes Russia",
                "media_type": MediaType.MAGAZINE,
                "website": "https://forbes.ru",
                "description": "Российское издание глобального делового журнала Forbes. Рейтинги богатейших людей и компаний, аналитика, интервью с топ-менеджерами. Размещение материала ассоциируется с высоким статусом бренда.",
                "email": "editorial@forbes.ru",
                "telegram_username": "@forbesrussia",
                "audience_size": 6_500_000,
                "monthly_reach": 16_000_000,
                "base_price": 10_000.0,
                "priority_multiplier": 2.3,
                "is_premium": True,
                "rating": 4.9,
                "categories": ["business", "general", "startups"]
            },
            {
                "name": "Expert.ru",
                "media_type": MediaType.MAGAZINE,
                "website": "https://expert.ru",
                "description": "Один из старейших российских деловых еженедельников. Глубокая аналитика рынков, отраслевые рейтинги, экспертные мнения. Особый авторитет в промышленных и B2B-секторах.",
                "email": "redaktor@expert.ru",
                "telegram_username": "@expertru",
                "audience_size": 2_500_000,
                "monthly_reach": 6_000_000,
                "base_price": 6_000.0,
                "priority_multiplier": 1.7,
                "is_premium": True,
                "rating": 4.6,
                "categories": ["business", "industry"]
            },

            # ── Технологические и IT-издания ────────────────────────────────
            {
                "name": "VC.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://vc.ru",
                "description": "Крупнейшее русскоязычное медиа о бизнесе, технологиях и стартапах. Активное комьюнити предпринимателей и инвесторов. Эффективно для продвижения продуктов в аудиторию технологических предпринимателей.",
                "email": "tips@vc.ru",
                "telegram_username": "@vcru",
                "audience_size": 2_500_000,
                "monthly_reach": 6_000_000,
                "base_price": 5_500.0,
                "priority_multiplier": 1.6,
                "is_premium": True,
                "rating": 4.8,
                "categories": ["tech", "business", "startups"]
            },
            {
                "name": "Habr",
                "media_type": MediaType.ONLINE,
                "website": "https://habr.com",
                "description": "Крупнейшая площадка для IT-специалистов и разработчиков. Более 3 млн читателей — инженеры, архитекторы, технические директора. Идеально для продвижения новых технологических продуктов и API.",
                "email": "press@habr.com",
                "telegram_username": "@habr_com",
                "audience_size": 3_200_000,
                "monthly_reach": 8_500_000,
                "base_price": 4_500.0,
                "priority_multiplier": 1.5,
                "is_premium": True,
                "rating": 4.7,
                "categories": ["tech", "security"]
            },
            {
                "name": "CNews",
                "media_type": MediaType.ONLINE,
                "website": "https://cnews.ru",
                "description": "Одно из старейших и крупнейших российских IT-изданий. Широкая корпоративная IT-аудитория: CIO, IT-директора, системные интеграторы. Особенно эффективно для B2B-новостей в ИТ-секторе.",
                "email": "newsline@cnews.ru",
                "telegram_username": "@cnewsru",
                "audience_size": 1_100_000,
                "monthly_reach": 2_800_000,
                "base_price": 3_500.0,
                "priority_multiplier": 1.3,
                "rating": 4.4,
                "categories": ["tech", "business", "telecom"]
            },
            {
                "name": "RB.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://rb.ru",
                "description": "Медиа о технологическом бизнесе и инновациях. Рейтинги стартапов, инвестиционные сделки, истории успеха российских предпринимателей. Хорошо воспринимается аудиторией венчурного рынка.",
                "email": "editor@rb.ru",
                "telegram_username": "@russianbasecamp",
                "audience_size": 1_600_000,
                "monthly_reach": 3_500_000,
                "base_price": 4_000.0,
                "priority_multiplier": 1.3,
                "is_premium": True,
                "rating": 4.5,
                "categories": ["business", "startups", "tech"]
            },
            {
                "name": "Rusbase",
                "media_type": MediaType.ONLINE,
                "website": "https://rusbase.com",
                "description": "Специализированное медиа о стартапах, венчурных инвестициях и инновациях. Уникальная база данных сделок и стартапов. Читают фаундеры, венчурные инвесторы, корпоративные инноваторы.",
                "email": "hello@rusbase.com",
                "telegram_username": "@rusbase",
                "audience_size": 900_000,
                "monthly_reach": 2_200_000,
                "base_price": 3_200.0,
                "priority_multiplier": 1.2,
                "rating": 4.4,
                "categories": ["tech", "startups", "business"]
            },
            {
                "name": "iXBT.com",
                "media_type": MediaType.ONLINE,
                "website": "https://www.ixbt.com",
                "description": "Один из старейших российских технических порталов. Обзоры железа, гаджетов и программного обеспечения. Огромная лояльная аудитория технически грамотных пользователей и энтузиастов.",
                "email": "pr@ixbt.com",
                "telegram_username": "@ixbt_live",
                "audience_size": 4_000_000,
                "monthly_reach": 10_000_000,
                "base_price": 3_800.0,
                "priority_multiplier": 1.3,
                "rating": 4.5,
                "categories": ["tech"]
            },
            {
                "name": "3DNews",
                "media_type": MediaType.ONLINE,
                "website": "https://3dnews.ru",
                "description": "Авторитетный портал о высоких технологиях, электронике и программном обеспечении. Профессиональные тест-обзоры, более 3 млн уникальных посетителей в месяц. Читают продвинутые пользователи и профессионалы IT.",
                "email": "info@3dnews.ru",
                "telegram_username": "@dddn",
                "audience_size": 3_000_000,
                "monthly_reach": 7_500_000,
                "base_price": 3_200.0,
                "priority_multiplier": 1.2,
                "rating": 4.4,
                "categories": ["tech"]
            },
            {
                "name": "Roem.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://roem.ru",
                "description": "Профессиональное медиа о российском интернет-бизнесе и технологическом предпринимательстве. Острая аналитика рынка, инсайды из индустрии. Читают инсайдеры рунета, венчурные фонды и топ-менеджеры.",
                "email": "info@roem.ru",
                "telegram_username": "@roemru",
                "audience_size": 500_000,
                "monthly_reach": 1_200_000,
                "base_price": 2_200.0,
                "priority_multiplier": 1.1,
                "rating": 4.2,
                "categories": ["tech", "startups", "telecom"]
            },
            {
                "name": "Ferra.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://www.ferra.ru",
                "description": "Популярный портал о гаджетах, мобильных устройствах и потребительской электронике. Обзоры, новости рынка, советы покупателям. Широкий охват массового технологически грамотного потребителя.",
                "email": "editor@ferra.ru",
                "telegram_username": "@ferra_ru",
                "audience_size": 2_800_000,
                "monthly_reach": 6_500_000,
                "base_price": 2_800.0,
                "priority_multiplier": 1.2,
                "rating": 4.3,
                "categories": ["tech"]
            },

            # ── Кибербезопасность ────────────────────────────────────────────
            {
                "name": "Securitylab",
                "media_type": MediaType.ONLINE,
                "website": "https://www.securitylab.ru",
                "description": "Ведущий российский портал по информационной безопасности от Positive Technologies. Новости об уязвимостях, утечках, инцидентах. Читают CISO, специалисты по ИБ, аналитики.",
                "email": "editor@securitylab.ru",
                "telegram_username": "@securitylab_ru",
                "audience_size": 700_000,
                "monthly_reach": 1_800_000,
                "base_price": 2_800.0,
                "priority_multiplier": 1.2,
                "rating": 4.3,
                "categories": ["security", "tech"]
            },
            {
                "name": "Anti-Malware.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://www.anti-malware.ru",
                "description": "Специализированный ресурс по практической кибербезопасности. Независимые тесты антивирусов и средств защиты, аналитика угроз. Авторитетный источник для профессионального ИБ-сообщества.",
                "email": "info@anti-malware.ru",
                "telegram_username": "@antimairu",
                "audience_size": 350_000,
                "monthly_reach": 900_000,
                "base_price": 2_000.0,
                "rating": 4.2,
                "categories": ["security", "tech"]
            },

            # ── Маркетинг и PR ───────────────────────────────────────────────
            {
                "name": "Sostav.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://sostav.ru",
                "description": "Главное профессиональное издание маркетинговой и рекламной индустрии России. Кейсы, рейтинги агентств, новости брендов. Читают директора по маркетингу, бренд-менеджеры, специалисты по рекламе.",
                "email": "news@sostav.ru",
                "telegram_username": "@sostav_ru",
                "audience_size": 550_000,
                "monthly_reach": 1_400_000,
                "base_price": 2_800.0,
                "priority_multiplier": 1.2,
                "rating": 4.3,
                "categories": ["marketing", "business"]
            },
            {
                "name": "Cossa",
                "media_type": MediaType.ONLINE,
                "website": "https://www.cossa.ru",
                "description": "Независимое медиа для специалистов по интернет-маркетингу. Практические статьи, кейсы, гайды. Особенно сильно в диджитал-маркетинге, SEO и performance-рекламе.",
                "email": "editor@cossa.ru",
                "telegram_username": "@cossaru",
                "audience_size": 450_000,
                "monthly_reach": 1_100_000,
                "base_price": 2_200.0,
                "rating": 4.2,
                "categories": ["marketing", "tech", "business"]
            },
            {
                "name": "Adindex.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://adindex.ru",
                "description": "Профессиональный портал рекламной и медиаиндустрии. Рейтинги рекламодателей, агентств и площадок. Публикации привлекают внимание отраслевого сообщества и закрепляют экспертность бренда.",
                "email": "editor@adindex.ru",
                "telegram_username": "@adindexru",
                "audience_size": 280_000,
                "monthly_reach": 700_000,
                "base_price": 1_800.0,
                "rating": 4.0,
                "categories": ["marketing", "business"]
            },

            # ── Финтех ───────────────────────────────────────────────────────
            {
                "name": "Bankiros.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://bankiros.ru",
                "description": "Крупный финансовый портал для частных клиентов и бизнеса. Обзоры банковских продуктов, инвестиций, страхования. Широкая потребительская аудитория, принимающая финансовые решения.",
                "email": "press@bankiros.ru",
                "audience_size": 5_000_000,
                "monthly_reach": 12_000_000,
                "base_price": 4_500.0,
                "priority_multiplier": 1.4,
                "rating": 4.3,
                "categories": ["fintech", "business"]
            },
            {
                "name": "Banki.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://www.banki.ru",
                "description": "Ведущий российский финансовый маркетплейс и медиа. Агрегатор банковских предложений, огромная база отзывов. Ключевой источник для потребителей финансовых услуг.",
                "email": "pr@banki.ru",
                "telegram_username": "@bankiru",
                "audience_size": 8_000_000,
                "monthly_reach": 20_000_000,
                "base_price": 6_000.0,
                "priority_multiplier": 1.5,
                "is_premium": True,
                "rating": 4.5,
                "categories": ["fintech", "business"]
            },
            {
                "name": "Frank RG",
                "media_type": MediaType.ONLINE,
                "website": "https://frankrg.com",
                "description": "Специализированное b2b-медиа и аналитическое агентство для финансового рынка. Глубокая аналитика банковского сектора, страхования и управления активами. Читают топ-менеджеры банков и финансовых компаний.",
                "email": "info@frankrg.com",
                "telegram_username": "@frank_rg",
                "audience_size": 200_000,
                "monthly_reach": 500_000,
                "base_price": 5_000.0,
                "priority_multiplier": 1.6,
                "is_premium": True,
                "rating": 4.7,
                "categories": ["fintech", "business"]
            },

            # ── Телеком ──────────────────────────────────────────────────────
            {
                "name": "TelecomDaily",
                "media_type": MediaType.ONLINE,
                "website": "https://telecomdaily.ru",
                "description": "Ведущее отраслевое медиа телекоммуникационного рынка России. Новости операторов, регуляторики, инфраструктуры. Читают менеджеры и эксперты телеком-индустрии.",
                "email": "info@telecomdaily.ru",
                "telegram_username": "@tdaily",
                "audience_size": 180_000,
                "monthly_reach": 420_000,
                "base_price": 2_500.0,
                "priority_multiplier": 1.2,
                "rating": 4.2,
                "categories": ["telecom", "tech", "industry"]
            },
            {
                "name": "Comnews",
                "media_type": MediaType.ONLINE,
                "website": "https://www.comnews.ru",
                "description": "Профессиональное издание для операторов связи и IT-компаний. Подробное освещение сделок, конкурсов и регуляторных изменений. Незаменимый источник для участников телеком-рынка.",
                "email": "edit@comnews.ru",
                "audience_size": 120_000,
                "monthly_reach": 300_000,
                "base_price": 2_000.0,
                "rating": 4.1,
                "categories": ["telecom", "tech", "industry"]
            },

            # ── Отраслевые и e-commerce ──────────────────────────────────────
            {
                "name": "Retail.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://retail.ru",
                "description": "Ключевое медиа для профессионалов розничной торговли. Тренды ретейла, e-commerce, логистики и FMCG. Читают топ-менеджеры крупных торговых сетей и поставщиков.",
                "email": "info@retail.ru",
                "telegram_username": "@retailru",
                "audience_size": 400_000,
                "monthly_reach": 1_000_000,
                "base_price": 3_000.0,
                "priority_multiplier": 1.2,
                "rating": 4.2,
                "categories": ["retail", "industry", "business"]
            },
            {
                "name": "E-pepper.ru",
                "media_type": MediaType.ONLINE,
                "website": "https://e-pepper.ru",
                "description": "Специализированное медиа об e-commerce и онлайн-ретейле. Практические советы, кейсы интернет-магазинов, аналитика рынка. Аудитория — владельцы и менеджеры онлайн-бизнесов.",
                "email": "info@e-pepper.ru",
                "telegram_username": "@epepper_ru",
                "audience_size": 150_000,
                "monthly_reach": 380_000,
                "base_price": 1_800.0,
                "rating": 4.0,
                "categories": ["retail", "tech", "startups"]
            },

            # ── Региональные деловые ─────────────────────────────────────────
            {
                "name": "Деловой Петербург",
                "media_type": MediaType.NEWSPAPER,
                "website": "https://www.dp.ru",
                "description": "Ведущее деловое издание Санкт-Петербурга и Северо-Запада России. Корпоративные новости, рейтинги, интервью с региональными лидерами. Незаменимо для продвижения в петербургской бизнес-среде.",
                "email": "info@dp.ru",
                "telegram_username": "@dpru",
                "audience_size": 1_200_000,
                "monthly_reach": 3_000_000,
                "base_price": 4_000.0,
                "priority_multiplier": 1.3,
                "rating": 4.4,
                "categories": ["business", "general"]
            },
        ]

        created = 0
        for media_info in media_data:
            cat_slugs = media_info.pop("categories", [])

            existing = db.query(MediaOutlet).filter_by(name=media_info["name"]).first()
            if not existing:
                media = MediaOutlet(**media_info)
                for slug in cat_slugs:
                    if slug in categories:
                        media.categories.append(categories[slug])
                db.add(media)
                created += 1
            else:
                # Обновляем описание и telegram если изменились
                existing.description = media_info.get("description", existing.description)
                existing.telegram_username = media_info.get("telegram_username", existing.telegram_username)
                print(f"  ↻ '{media_info['name']}' — обновлено")

        db.commit()
        print(f"✓ Создано {created} СМИ, обновлено {len(media_data) - created}")
        print(f"\n✅ База данных успешно заполнена! Всего СМИ: {len(media_data)}")

    except Exception as e:
        print(f"❌ Ошибка при заполнении БД: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
