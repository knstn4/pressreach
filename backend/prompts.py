from enum import Enum
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Системный промпт для генерации пресс-релизов
SYSTEM_PROMPT = """
Ты - профессиональный PR-специалист с 15-летним опытом создания пресс-релизов для крупных компаний и стартапов.
Ты создаёшь качественные пресс-релизы, которые соответствуют международным стандартам медиа-индустрии.
Ты строго следуешь требованиям:
1. Формат: JSON, используй двойные кавычки при форматировании, особо тщательно следуй правилам JSON
2. Стиль: Профессиональный, журналистский, но понятный широкой аудитории
3. Структура: Заголовок, подзаголовок, лид-абзац, основной текст, цитаты, контактная информация
4. Язык: Русский, соответствующий стандартам российских медиа
"""

# Системный промпт для улучшения текста
TEXT_IMPROVEMENT_SYSTEM_PROMPT = """
Ты - профессиональный редактор и корректор текстов с опытом работы в ведущих изданиях.
Ты обладаешь безупречным знанием русского языка, грамматики, пунктуации и стилистики.
Твоя задача - улучшать тексты, сохраняя их смысл и авторский стиль, но делая их более профессиональными.
"""

class PressReleaseType(Enum):
    PRODUCT_LAUNCH = "product_launch"
    COMPANY_NEWS = "company_news"
    PARTNERSHIP = "partnership"
    FUNDING = "funding"
    ACHIEVEMENT = "achievement"
    EVENT = "event"
    PERSONNEL = "personnel"


class ImprovementMode(Enum):
    GRAMMAR = "grammar"  # Исправление грамматических ошибок
    REWRITE = "rewrite"  # Переписывание в определённом стиле


class WritingStyle(Enum):
    FORMAL = "formal"  # Официальный стиль
    BUSINESS = "business"  # Деловой стиль
    CASUAL = "casual"  # Неформальный стиль
    JOURNALISTIC = "journalistic"  # Журналистский стиль
    ACADEMIC = "academic"  # Академический стиль
    MARKETING = "marketing"  # Маркетинговый стиль
    CONCISE = "concise"  # Краткий и лаконичный


def build_prompt_for_press_release(press_release_data: dict) -> str:
    """
    Создает промпт для генерации пресс-релиза на основе входных данных
    """
    logger.info(f"Сборка промпта для пресс-релиза: {press_release_data.get('type')}")

    release_type = press_release_data.get('type', PressReleaseType.COMPANY_NEWS.value)
    company_name = press_release_data.get('company_name', '')
    news_summary = press_release_data.get('news_summary', '')
    target_audience = press_release_data.get('target_audience', 'Широкая аудитория')
    key_messages = press_release_data.get('key_messages', [])
    quotes = press_release_data.get('quotes', [])
    contact_person = press_release_data.get('contact_person', '')
    additional_info = press_release_data.get('additional_info', '')

    base_prompt = f"""
    Создай профессиональный пресс-релиз со следующими параметрами:
    - Компания: {company_name}
    - Тип новости: {release_type}
    - Краткое описание новости: {news_summary}
    - Целевая аудитория: {target_audience}
    - Ключевые сообщения: {', '.join(key_messages) if key_messages else 'Не указаны'}
    - Дополнительная информация: {additional_info}

    Пресс-релиз должен быть структурированным, привлекательным для журналистов и содержать всю необходимую информацию.
    """

    if release_type == PressReleaseType.PRODUCT_LAUNCH.value:
        specific_prompt = """
        Это пресс-релиз о запуске нового продукта. Обязательно включи:
        - Описание продукта и его уникальных характеристик
        - Преимущества для пользователей
        - Информацию о доступности и ценах (если указана)
        - Цитату представителя компании о значимости запуска (если есть в запросе)
        """
    elif release_type == PressReleaseType.FUNDING.value:
        specific_prompt = """
        Это пресс-релиз о привлечении инвестиций. Обязательно включи:
        - Размер привлеченного финансирования
        - Информацию об инвесторах
        - Планы по использованию средств
        - Цитаты руководства о планах развития (если есть в запросе)
        """
    elif release_type == PressReleaseType.PARTNERSHIP.value:
        specific_prompt = """
        Это пресс-релиз о партнерстве. Обязательно включи:
        - Информацию о партнерах
        - Цели и выгоды партнерства
        - Планируемые совместные проекты
        - Цитаты представителей обеих сторон (если есть в запросе)
        """
    else:
        specific_prompt = """
        Создай пресс-релиз, следуя стандартной структуре:
        - Привлекательный заголовок
        - Информативный лид-абзац
        - Подробности в основном тексте
        - Релевантные цитаты (если есть в запросе)
        """

    json_format_prompt = """

    Твой ответ должен быть только в формате JSON. Пример структуры:
    {
        "headline": "Привлекательный заголовок пресс-релиза",
        "subheadline": "Дополняющий подзаголовок",
        "lead_paragraph": "Краткий лид-абзац с основной информацией",
        "body_text": "Основной текст пресс-релиза с подробностями",
        "quotes": [
            {
                "text": "Текст цитаты",
                "author": "Имя и должность автора цитаты"
            }
        ],
        "contact_info": "Контактная информация для СМИ",
        "boilerplate": "Краткая информация о компании"
    }
    """

    full_prompt = base_prompt + specific_prompt + json_format_prompt

    logger.info(f"Промпт для пресс-релиза создан")
    return full_prompt


def build_prompt_for_text_improvement(text: str, mode: str, style: str = None) -> str:
    """
    Создает промпт для улучшения текста

    Args:
        text: Исходный текст для улучшения
        mode: Режим работы (grammar или rewrite)
        style: Стиль для переписывания (если mode=rewrite)
    """
    logger.info(f"Сборка промпта для улучшения текста, режим: {mode}")

    if mode == ImprovementMode.GRAMMAR.value:
        task_prompt = """
        Твоя задача - проверить и исправить грамматические, орфографические и пунктуационные ошибки в тексте.

        ВАЖНО:
        - Сохрани исходный смысл и структуру текста
        - Исправь только явные ошибки
        - НЕ меняй стиль изложения
        - НЕ добавляй новую информацию
        - НЕ удаляй важные детали
        - Исправь опечатки, грамматические и пунктуационные ошибки

        Исходный текст:
        ```
        {text}
        ```

        Верни результат в формате JSON:
        {{
            "original_text": "исходный текст",
            "improved_text": "исправленный текст",
            "errors_found": [
                {{
                    "type": "тип ошибки (грамматика/пунктуация/орфография)",
                    "original": "ошибочный фрагмент",
                    "corrected": "исправленный фрагмент",
                    "explanation": "объяснение исправления"
                }}
            ],
            "summary": "краткое описание сделанных исправлений"
        }}
        """.format(text=text)

    elif mode == ImprovementMode.REWRITE.value:
        style_descriptions = {
            WritingStyle.FORMAL.value: "Официальный, формальный стиль для документов и официальных сообщений",
            WritingStyle.BUSINESS.value: "Деловой стиль для корпоративной переписки и бизнес-коммуникаций",
            WritingStyle.CASUAL.value: "Неформальный, дружественный стиль для блогов и социальных сетей",
            WritingStyle.JOURNALISTIC.value: "Журналистский стиль для новостных статей и пресс-релизов",
            WritingStyle.ACADEMIC.value: "Академический стиль для научных работ и исследований",
            WritingStyle.MARKETING.value: "Маркетинговый стиль с призывами к действию и эмоциональным воздействием",
            WritingStyle.CONCISE.value: "Краткий и лаконичный стиль без лишних деталей"
        }

        style_description = style_descriptions.get(style, "профессиональный")

        task_prompt = """
        Твоя задача - переписать текст в стиле: {style_description}

        ВАЖНО:
        - Сохрани основной смысл и ключевые факты
        - Адаптируй стиль изложения под указанный формат
        - Улучши читаемость и структуру
        - Исправь все грамматические ошибки
        - Сделай текст более профессиональным

        Исходный текст:
        ```
        {text}
        ```

        Верни результат в формате JSON:
        {{
            "original_text": "исходный текст",
            "rewritten_text": "переписанный текст",
            "style_applied": "{style}",
            "key_changes": [
                "описание ключевых изменений"
            ],
            "summary": "краткое описание проделанной работы"
        }}
        """.format(text=text, style_description=style_description, style=style)

    else:
        raise ValueError(f"Неизвестный режим: {mode}")

    logger.info("Промпт для улучшения текста создан")
    return task_prompt


def build_prompt_for_media_selection(text: str, available_categories: list) -> str:
    """
    Создает промпт для анализа текста и подбора релевантных категорий СМИ

    Args:
        text: Текст пресс-релиза для анализа
        available_categories: Список доступных категорий СМИ с их описаниями
    """
    logger.info("Сборка промпта для подбора релевантных СМИ")

    categories_info = "\n".join([
        f"- {cat['name']}: {cat.get('description', 'Без описания')}"
        for cat in available_categories
    ])

    prompt = f"""
    Проанализируй следующий текст пресс-релиза и определи, каким категориям СМИ он будет наиболее интересен.

    ТЕКСТ ПРЕСС-РЕЛИЗА:
    ```
    {text}
    ```

    ДОСТУПНЫЕ КАТЕГОРИИ СМИ:
    {categories_info}

    ЗАДАЧА:
    1. Внимательно прочитай текст и определи его основную тематику
    2. Выбери 2-5 наиболее релевантных категорий СМИ из списка выше
    3. Для каждой выбранной категории укажи уровень релевантности (1-10)
    4. Кратко объясни, почему эта категория релевантна

    ВАЖНО:
    - Используй только категории из предоставленного списка
    - Не выбирай все категории подряд, будь избирательным
    - Оценивай релевантность объективно
    - Приоритизируй категории с наибольшей релевантностью

    Верни результат в формате JSON:
    {{
        "selected_categories": [
            {{
                "category_name": "название категории",
                "relevance_score": 8,
                "reasoning": "объяснение, почему эта категория релевантна"
            }}
        ],
        "text_summary": "краткое описание тематики текста (1-2 предложения)",
        "target_audience": "целевая аудитория (журналисты, инвесторы, потребители и т.д.)"
    }}
    """

    logger.info("Промпт для подбора СМИ создан")
    return prompt
