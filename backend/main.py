import asyncio
import json
import logging
import os
import re
import sys
import uuid
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

# Добавляем текущую папку в путь для импортов
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from open_router_client import OpenRouterClient
    from prompts import build_prompt_for_press_release
    from database import SessionLocal, MediaOutlet, Category, Distribution, DeliveryLog, MediaType, ContactType, User, PlanType, UserBranding
    from clerk_auth import get_current_user, get_current_user_optional
    from email_template import generate_email_html, generate_plain_text_email
except ImportError:
    # Альтернативный импорт для запуска из корневой папки
    from backend.open_router_client import OpenRouterClient
    from backend.prompts import build_prompt_for_press_release
    from backend.database import SessionLocal, MediaOutlet, Category, Distribution, DeliveryLog, MediaType, ContactType, User, PlanType, UserBranding
    from backend.clerk_auth import get_current_user, get_current_user_optional
    from backend.email_template import generate_email_html, generate_plain_text_email


def extract_json(text: str) -> str:
    """
    Извлекает первый JSON-объект или массив из текста, удаляя markdown и лишние символы.
    """
    if not text:
        return ""
    # Удаляем markdown-обёртки
    text = re.sub(r"```[jJ][sS][oO][nN]?", "", text)
    text = text.replace("```", "").strip()
    # Ищем первый {...} или [...]
    match = re.search(r'(\{.*}|\[.*])', text, re.DOTALL)
    if match:
        return match.group(1)
    return text  # fallback: если не нашли, возвращаем как есть


# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="PressReach API", description="AI-powered press release generation service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Монтируем статические файлы (для фронтенда)
# app.mount("/static", StaticFiles(directory="../build/static"), name="static")

open_router_client = OpenRouterClient()


# Dependency для получения DB сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Модели данных для API
class PressReleaseRequest(BaseModel):
    company_name: str
    news_summary: str
    type: str = "company_news"
    target_audience: str = "Широкая аудитория"
    key_messages: List[str] = []
    quotes: List[dict] = []
    contact_person: str = ""
    additional_info: str = ""
    model: str = "deepseek"


class TextImprovementRequest(BaseModel):
    text: str
    mode: str = "grammar"  # "grammar" или "rewrite"
    style: str = None  # Для mode="rewrite": "formal", "business", "casual", etc.
    model: str = "deepseek"


class CreateDistributionRequest(BaseModel):
    press_release_title: str
    press_release_content: str
    press_release_data: Optional[str] = None
    company_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    media_ids: List[int]
    scheduled_at: Optional[str] = None


class CalculatePriceRequest(BaseModel):
    media_ids: List[int]


class CreateMediaOutletRequest(BaseModel):
    name: str
    email: str
    media_type: Optional[str] = "online"
    website: Optional[str] = ""
    description: Optional[str] = ""
    telegram_username: Optional[str] = ""
    phone: Optional[str] = ""
    whatsapp: Optional[str] = ""
    audience_size: Optional[int] = 0
    monthly_reach: Optional[int] = 0
    base_price: Optional[float] = 0.0
    priority_multiplier: Optional[float] = 1.0
    is_active: Optional[bool] = True
    is_premium: Optional[bool] = False
    rating: Optional[float] = 4.0
    category_ids: Optional[List[int]] = []


class UpdateMediaOutletRequest(BaseModel):
    name: str
    email: str
    media_type: Optional[str] = "online"
    website: Optional[str] = ""
    description: Optional[str] = ""
    telegram_username: Optional[str] = ""
    phone: Optional[str] = ""
    whatsapp: Optional[str] = ""
    audience_size: Optional[int] = 0
    monthly_reach: Optional[int] = 0
    base_price: Optional[float] = 0.0
    priority_multiplier: Optional[float] = 1.0
    is_active: Optional[bool] = True
    is_premium: Optional[bool] = False
    rating: Optional[float] = 4.0
    category_ids: Optional[List[int]] = []


#  Переопределяем метод default для JSONEncoder, чтобы поддерживать сериализацию UUID и datetime
old_default = json.JSONEncoder.default


def new_default(self, obj):
    if isinstance(obj, uuid.UUID):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return old_default(self, obj)


json.JSONEncoder.default = new_default


@app.get("/")
async def root():
    """
    Корневой endpoint для проверки работы API
    """
    return {"message": "PressReach API is running", "status": "ok", "service": "press_release_generator"}


@app.get("/health")
async def health_check():
    """
    Endpoint для проверки здоровья сервиса
    """
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/generate-press-release")
async def generate_press_release(request: PressReleaseRequest):
    """
    Генерация пресс-релиза на основе входных данных
    """
    logger.info(f"Получен запрос на генерацию пресс-релиза для компании: {request.company_name}")

    try:
        # Собираем данные для промпта
        press_release_data = {
            "company_name": request.company_name,
            "news_summary": request.news_summary,
            "type": request.type,
            "target_audience": request.target_audience,
            "key_messages": request.key_messages,
            "quotes": request.quotes,
            "contact_person": request.contact_person,
            "additional_info": request.additional_info
        }

        # Создаем промпт
        press_release_prompt = build_prompt_for_press_release(press_release_data)

        try:
            # Генерируем пресс-релиз
            press_release_text = await open_router_client.generate_press_release(
                user_prompt=press_release_prompt,
                model=request.model
            )
        except Exception as e:
            logger.error(f"Ошибка генерации пресс-релиза: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Ошибка API: {str(e)}")

        # Извлекаем JSON из ответа
        cleaned_press_release = extract_json(press_release_text)
        logger.info("Пресс-релиз успешно сгенерирован")

        try:
            # Парсим JSON
            parsed_press_release = json.loads(cleaned_press_release)

            # Добавляем метаданные
            response_data = {
                "success": True,
                "press_release": parsed_press_release,
                "generated_at": datetime.now().isoformat(),
                "company_name": request.company_name,
                "type": request.type
            }

            return JSONResponse(content=response_data)

        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга JSON пресс-релиза: {str(e)}")
            # Возвращаем сырой текст, если не удалось распарсить JSON
            return JSONResponse(content={
                "success": False,
                "error": "Ошибка парсинга ответа ИИ",
                "raw_response": cleaned_press_release
            })

    except Exception as e:
        logger.error(f"Неожиданная ошибка: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Неожиданная ошибка: {str(e)}")


@app.post("/improve-text")
async def improve_text(request: TextImprovementRequest):
    """
    Улучшение текста: проверка грамматики или переписывание в определённом стиле
    """
    logger.info(f"Получен запрос на улучшение текста, режим: {request.mode}")

    try:
        # Импортируем функцию для создания промпта
        try:
            from prompts import build_prompt_for_text_improvement
        except ImportError:
            from backend.prompts import build_prompt_for_text_improvement

        # Создаем промпт
        user_prompt = build_prompt_for_text_improvement(
            text=request.text,
            mode=request.mode,
            style=request.style
        )

        # Вызываем AI для улучшения текста
        logger.info("Отправляем запрос к AI для улучшения текста")
        ai_response = await open_router_client.improve_text(
            user_prompt=user_prompt,
            model=request.model
        )

        # Извлекаем JSON из ответа
        cleaned_response = extract_json(ai_response)
        logger.info(f"Получен ответ от AI: {cleaned_response[:200]}...")

        # Парсим JSON
        try:
            result_data = json.loads(cleaned_response)

            response_data = {
                "success": True,
                "mode": request.mode,
                "style": request.style if request.mode == "rewrite" else None,
                "result": result_data,
                "generated_at": datetime.now().isoformat()
            }

            return JSONResponse(content=response_data)

        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга JSON результата: {str(e)}")
            return JSONResponse(content={
                "success": False,
                "error": "Ошибка парсинга ответа ИИ",
                "raw_response": cleaned_response
            })

    except Exception as e:
        logger.error(f"Неожиданная ошибка при улучшении текста: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Неожиданная ошибка: {str(e)}")


# ==================== USER ENDPOINTS ====================

@app.post("/api/user/sync")
async def sync_user(
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Синхронизировать пользователя из Clerk с нашей БД
    Вызывается при первом входе или для обновления данных
    """
    try:
        clerk_user_id = user_data.get("sub")  # Clerk user ID
        email = user_data.get("email") or (user_data.get("email_addresses", [{}])[0].get("email_address", ""))

        # Проверяем, существует ли пользователь
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            # Создаём нового пользователя
            user = User(
                clerk_user_id=clerk_user_id,
                email=email,
                first_name=user_data.get("first_name", ""),
                last_name=user_data.get("last_name", ""),
                plan_type=PlanType.FREE,
                credits=100,
                monthly_releases_limit=3
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Создан новый пользователь: {email}")
        else:
            # Обновляем last_login
            user.last_login = datetime.utcnow()
            db.commit()

        return {
            "id": user.id,
            "clerk_user_id": user.clerk_user_id,
            "email": user.email,
            "plan_type": user.plan_type.value,
            "credits": user.credits,
            "status": "synced"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка синхронизации пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/stats")
async def get_user_stats(
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить статистику пользователя для дашборда
    """
    try:
        clerk_user_id = user_data.get("sub")

        # Находим пользователя
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Получаем статистику
        total_distributions = db.query(Distribution).filter(Distribution.user_id == user.id).count()

        # Подсчитываем медиа охват
        distributions = db.query(Distribution).filter(Distribution.user_id == user.id).all()
        total_media_count = sum(d.total_media_count for d in distributions)

        # Получаем последние релизы
        recent_releases = db.query(Distribution)\
            .filter(Distribution.user_id == user.id)\
            .order_by(Distribution.created_at.desc())\
            .limit(5)\
            .all()

        # План и лимиты
        plan_config = {
            PlanType.FREE: {"name": "Free", "limit": 3, "credits": 100},
            PlanType.STARTER: {"name": "Starter", "limit": 10, "credits": 500},
            PlanType.PROFESSIONAL: {"name": "Professional", "limit": 999, "credits": 1000},
            PlanType.ENTERPRISE: {"name": "Enterprise", "limit": 9999, "credits": 99999},
        }

        plan_info = plan_config.get(user.plan_type, plan_config[PlanType.FREE])

        return {
            "user_id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "plan_name": plan_info["name"],
            "plan_limit": plan_info["limit"],
            "total_releases": user.total_releases or len(distributions),
            "total_distributions": total_distributions,
            "total_credits": plan_info["credits"],
            "used_credits": plan_info["credits"] - user.credits,
            "remaining_credits": user.credits,
            "media_count": total_media_count,
            "recent_releases": [
                {
                    "id": d.id,
                    "title": d.press_release_title,
                    "created_at": d.created_at.isoformat() if d.created_at else None,
                    "status": d.status,
                    "media_count": d.total_media_count
                }
                for d in recent_releases
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения статистики: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories")
async def get_categories(db: Session = Depends(get_db)):
    """
    Получить список всех категорий СМИ
    """
    try:
        categories = db.query(Category).all()
        return [{
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description
        } for cat in categories]
    except Exception as e:
        logger.error(f"Ошибка получения категорий: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/media")
async def get_media(
    category_id: Optional[int] = None,
    is_premium: Optional[bool] = None,
    is_active: Optional[bool] = None,  # Изменено: None по умолчанию, чтобы получать все СМИ
    db: Session = Depends(get_db)
):
    """
    Получить список медиа-изданий с фильтрацией
    """
    try:
        query = db.query(MediaOutlet)

        if is_active is not None:
            query = query.filter(MediaOutlet.is_active == is_active)

        if is_premium is not None:
            query = query.filter(MediaOutlet.is_premium == is_premium)

        if category_id:
            query = query.join(MediaOutlet.categories).filter(Category.id == category_id)

        media_outlets = query.all()

        return [{
            "id": media.id,
            "name": media.name,
            "media_type": media.media_type.value,
            "website": media.website,
            "description": media.description,
            "email": media.email,
            "telegram_username": media.telegram_username,
            "phone": media.phone,
            "whatsapp": media.whatsapp,
            "audience_size": media.audience_size,
            "monthly_reach": media.monthly_reach,
            "base_price": media.base_price,
            "priority_multiplier": media.priority_multiplier,
            "is_active": media.is_active,
            "is_premium": media.is_premium,
            "rating": media.rating,
            "categories": [{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in media.categories]
        } for media in media_outlets]
    except Exception as e:
        logger.error(f"Ошибка получения медиа: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calculate-price")
async def calculate_price(request: CalculatePriceRequest, db: Session = Depends(get_db)):
    """
    Рассчитать стоимость рассылки по выбранным СМИ
    """
    try:
        media_outlets = db.query(MediaOutlet).filter(MediaOutlet.id.in_(request.media_ids)).all()

        if not media_outlets:
            raise HTTPException(status_code=404, detail="Медиа не найдены")

        total_price = 0
        breakdown = []

        for media in media_outlets:
            price = media.calculate_price()
            total_price += price
            breakdown.append({
                "id": media.id,
                "name": media.name,
                "base_price": media.base_price,
                "priority_multiplier": media.priority_multiplier,
                "is_premium": media.is_premium,
                "calculated_price": price
            })

        return {
            "total_price": total_price,
            "media_count": len(media_outlets),
            "breakdown": breakdown
        }
    except Exception as e:
        logger.error(f"Ошибка расчёта цены: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/distributions")
async def create_distribution(
    request: CreateDistributionRequest,
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Создать новую рассылку пресс-релиза
    """
    try:
        # Получаем пользователя
        clerk_user_id = user_data.get("sub")
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        # Увеличиваем счётчик релизов
        user.total_releases = (user.total_releases or 0) + 1
        user.total_distributions = (user.total_distributions or 0) + 1

        # Получаем медиа
        media_outlets = db.query(MediaOutlet).filter(MediaOutlet.id.in_(request.media_ids)).all()

        if not media_outlets:
            raise HTTPException(status_code=404, detail="Медиа не найдены")

        # Получаем настройки брендинга пользователя
        branding = db.query(UserBranding).filter(UserBranding.user_id == user.id).first()

        branding_dict = None
        if branding:
            branding_dict = {
                'primary_color': branding.primary_color,
                'secondary_color': branding.secondary_color,
                'accent_color': branding.accent_color,
                'company_name': branding.company_name or user.email.split('@')[0],
                'company_tagline': branding.company_tagline,
                'contact_person': branding.contact_person,
                'contact_email': branding.contact_email or user.email,
                'contact_phone': branding.contact_phone,
                'website': branding.website,
                'logo_url': branding.logo_url,
                'linkedin_url': branding.linkedin_url,
                'twitter_url': branding.twitter_url,
                'facebook_url': branding.facebook_url,
                'instagram_url': branding.instagram_url,
                'youtube_url': branding.youtube_url,
                'telegram_url': branding.telegram_url,
                'email_signature': branding.email_signature,
                'default_closing': branding.default_closing,
                'show_logo_in_header': branding.show_logo_in_header,
                'show_social_links': branding.show_social_links,
                'footer_text': branding.footer_text,
            }

        # Генерируем HTML и plain text версии письма
        email_html = generate_email_html(
            press_release_title=request.press_release_title,
            press_release_content=request.press_release_content,
            branding=branding_dict
        )

        email_plain = generate_plain_text_email(
            press_release_title=request.press_release_title,
            press_release_content=request.press_release_content,
            branding=branding_dict
        )

        # Рассчитываем общую стоимость
        total_price = sum(media.calculate_price() for media in media_outlets)

        # Создаём дистрибуцию
        distribution = Distribution(
            user_id=user.id,
            press_release_title=request.press_release_title,
            press_release_content=request.press_release_content,
            press_release_data={
                **(request.press_release_data or {}),
                'email_html': email_html,
                'email_plain': email_plain,
                'branding_used': branding_dict is not None
            },
            company_name=request.company_name,
            contact_email=request.contact_email,
            contact_phone=request.contact_phone,
            scheduled_at=datetime.fromisoformat(request.scheduled_at) if request.scheduled_at else None,
            status="pending",
            total_media_count=len(media_outlets),
            sent_count=0,
            failed_count=0,
            total_price=total_price
        )

        # Добавляем медиа к дистрибуции
        distribution.media_outlets = media_outlets

        db.add(distribution)
        db.commit()
        db.refresh(distribution)

        return {
            "id": distribution.id,
            "status": distribution.status,
            "total_price": distribution.total_price,
            "total_media_count": distribution.total_media_count,
            "created_at": distribution.created_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка создания дистрибуции: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/distributions/{distribution_id}")
async def get_distribution(
    distribution_id: int,
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить информацию о дистрибуции
    """
    try:
        # Проверяем, что пользователь авторизован
        clerk_user_id = user_data.get("sub")
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        distribution = db.query(Distribution).filter(
            Distribution.id == distribution_id,
            Distribution.user_id == user.id
        ).first()

        if not distribution:
            raise HTTPException(status_code=404, detail="Дистрибуция не найдена")

        # Получаем логи доставки
        delivery_logs = db.query(DeliveryLog).filter(DeliveryLog.distribution_id == distribution_id).all()

        return {
            "id": distribution.id,
            "press_release_title": distribution.press_release_title,
            "press_release_content": distribution.press_release_content,
            "company_name": distribution.company_name,
            "contact_email": distribution.contact_email,
            "contact_phone": distribution.contact_phone,
            "status": distribution.status,
            "total_media_count": distribution.total_media_count,
            "sent_count": distribution.sent_count,
            "failed_count": distribution.failed_count,
            "total_price": distribution.total_price,
            "created_at": distribution.created_at.isoformat() if distribution.created_at else None,
            "scheduled_at": distribution.scheduled_at.isoformat() if distribution.scheduled_at else None,
            "sent_at": distribution.sent_at.isoformat() if distribution.sent_at else None,
            "media_outlets": [{
                "id": media.id,
                "name": media.name,
                "media_type": media.media_type.value,
                "email": media.email,
                "status": "pending",
                "sent_at": None,
                "opened_at": None
            } for media in distribution.media_outlets],
            "delivery_logs": [{
                "id": log.id,
                "media_outlet_id": log.media_outlet_id,
                "contact_type": log.contact_type.value if hasattr(log.contact_type, 'value') else log.contact_type,
                "status": log.status,
                "sent_at": log.sent_at.isoformat() if log.sent_at else None,
                "error_message": log.error_message
            } for log in delivery_logs]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения дистрибуции: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/media")
async def create_media_outlet(
    request: CreateMediaOutletRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Создать новое СМИ
    """
    try:
        # Создаём медиа
        media = MediaOutlet(
            name=request.name,
            media_type=MediaType(request.media_type.lower()),
            email=request.email,
            website=request.website,
            description=request.description,
            telegram_username=request.telegram_username,
            phone=request.phone,
            whatsapp=request.whatsapp,
            audience_size=request.audience_size,
            monthly_reach=request.monthly_reach,
            base_price=request.base_price,
            priority_multiplier=request.priority_multiplier,
            is_active=request.is_active,
            is_premium=request.is_premium,
            rating=request.rating
        )

        # Добавляем категории
        if request.category_ids:
            categories = db.query(Category).filter(Category.id.in_(request.category_ids)).all()
            media.categories = categories

        db.add(media)
        db.commit()
        db.refresh(media)

        return {
            "id": media.id,
            "name": media.name,
            "message": "СМИ успешно создано"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка создания СМИ: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/media/{media_id}")
async def update_media_outlet(
    media_id: int,
    request: UpdateMediaOutletRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Обновить существующее СМИ
    """
    try:
        media = db.query(MediaOutlet).filter(MediaOutlet.id == media_id).first()

        if not media:
            raise HTTPException(status_code=404, detail="СМИ не найдено")

        # Обновляем поля
        media.name = request.name
        media.media_type = MediaType(request.media_type.lower())
        media.email = request.email
        media.website = request.website
        media.description = request.description
        media.telegram_username = request.telegram_username
        media.phone = request.phone
        media.whatsapp = request.whatsapp
        media.audience_size = request.audience_size
        media.monthly_reach = request.monthly_reach
        media.base_price = request.base_price
        media.priority_multiplier = request.priority_multiplier
        media.is_active = request.is_active
        media.is_premium = request.is_premium
        media.rating = request.rating

        # Обновляем категории
        if request.category_ids is not None:
            categories = db.query(Category).filter(Category.id.in_(request.category_ids)).all()
            media.categories = categories

        db.commit()
        db.refresh(media)

        return {
            "id": media.id,
            "name": media.name,
            "message": "СМИ успешно обновлено"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка обновления СМИ: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/media/{media_id}")
async def delete_media_outlet(media_id: int, db: Session = Depends(get_db)):
    """
    Удалить СМИ
    """
    try:
        media = db.query(MediaOutlet).filter(MediaOutlet.id == media_id).first()

        if not media:
            raise HTTPException(status_code=404, detail="СМИ не найдено")

        db.delete(media)
        db.commit()

        return {"message": "СМИ успешно удалено"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка удаления СМИ: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/distributions")
async def get_distributions(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Получить список дистрибуций
    """
    try:
        query = db.query(Distribution).order_by(Distribution.created_at.desc())

        if status:
            query = query.filter(Distribution.status == status)

        distributions = query.limit(limit).all()

        return [{
            "id": dist.id,
            "press_release_title": dist.press_release_title,
            "company_name": dist.company_name,
            "status": dist.status,
            "total_media_count": dist.total_media_count,
            "sent_count": dist.sent_count,
            "failed_count": dist.failed_count,
            "total_price": dist.total_price,
            "created_at": dist.created_at.isoformat(),
            "sent_at": dist.sent_at.isoformat() if dist.sent_at else None
        } for dist in distributions]
    except Exception as e:
        logger.error(f"Ошибка получения списка дистрибуций: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== BRANDING ENDPOINTS ====================

class BrandingRequest(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = "#3B82F6"
    secondary_color: Optional[str] = "#8B5CF6"
    accent_color: Optional[str] = "#10B981"
    company_name: Optional[str] = None
    company_tagline: Optional[str] = None
    company_description: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    telegram_url: Optional[str] = None
    email_signature: Optional[str] = None
    default_closing: Optional[str] = "С уважением"
    email_template_style: Optional[str] = "modern"
    show_logo_in_header: Optional[bool] = True
    show_social_links: Optional[bool] = True
    footer_text: Optional[str] = None


@app.get("/api/branding")
async def get_branding(
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить настройки брендинга пользователя
    """
    try:
        clerk_user_id = user_data.get("sub")
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        branding = db.query(UserBranding).filter(UserBranding.user_id == user.id).first()

        if not branding:
            # Создаем настройки по умолчанию
            branding = UserBranding(
                user_id=user.id,
                company_name=user.first_name or user.email.split('@')[0],
                contact_email=user.email
            )
            db.add(branding)
            db.commit()
            db.refresh(branding)

        return {
            "id": branding.id,
            "logo_url": branding.logo_url,
            "primary_color": branding.primary_color,
            "secondary_color": branding.secondary_color,
            "accent_color": branding.accent_color,
            "company_name": branding.company_name,
            "company_tagline": branding.company_tagline,
            "company_description": branding.company_description,
            "contact_person": branding.contact_person,
            "contact_email": branding.contact_email,
            "contact_phone": branding.contact_phone,
            "website": branding.website,
            "address": branding.address,
            "linkedin_url": branding.linkedin_url,
            "twitter_url": branding.twitter_url,
            "facebook_url": branding.facebook_url,
            "instagram_url": branding.instagram_url,
            "youtube_url": branding.youtube_url,
            "telegram_url": branding.telegram_url,
            "email_signature": branding.email_signature,
            "default_closing": branding.default_closing,
            "email_template_style": branding.email_template_style,
            "show_logo_in_header": branding.show_logo_in_header,
            "show_social_links": branding.show_social_links,
            "footer_text": branding.footer_text,
            "created_at": branding.created_at.isoformat() if branding.created_at else None,
            "updated_at": branding.updated_at.isoformat() if branding.updated_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/branding")
async def update_branding(
    request: BrandingRequest = Body(...),
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить настройки брендинга пользователя
    """
    try:
        clerk_user_id = user_data.get("sub")
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        branding = db.query(UserBranding).filter(UserBranding.user_id == user.id).first()

        if not branding:
            # Создаем новые настройки
            branding = UserBranding(user_id=user.id)
            db.add(branding)

        # Обновляем поля
        if request.logo_url is not None:
            branding.logo_url = request.logo_url
        if request.primary_color is not None:
            branding.primary_color = request.primary_color
        if request.secondary_color is not None:
            branding.secondary_color = request.secondary_color
        if request.accent_color is not None:
            branding.accent_color = request.accent_color
        if request.company_name is not None:
            branding.company_name = request.company_name
        if request.company_tagline is not None:
            branding.company_tagline = request.company_tagline
        if request.company_description is not None:
            branding.company_description = request.company_description
        if request.contact_person is not None:
            branding.contact_person = request.contact_person
        if request.contact_email is not None:
            branding.contact_email = request.contact_email
        if request.contact_phone is not None:
            branding.contact_phone = request.contact_phone
        if request.website is not None:
            branding.website = request.website
        if request.address is not None:
            branding.address = request.address
        if request.linkedin_url is not None:
            branding.linkedin_url = request.linkedin_url
        if request.twitter_url is not None:
            branding.twitter_url = request.twitter_url
        if request.facebook_url is not None:
            branding.facebook_url = request.facebook_url
        if request.instagram_url is not None:
            branding.instagram_url = request.instagram_url
        if request.youtube_url is not None:
            branding.youtube_url = request.youtube_url
        if request.telegram_url is not None:
            branding.telegram_url = request.telegram_url
        if request.email_signature is not None:
            branding.email_signature = request.email_signature
        if request.default_closing is not None:
            branding.default_closing = request.default_closing
        if request.email_template_style is not None:
            branding.email_template_style = request.email_template_style
        if request.show_logo_in_header is not None:
            branding.show_logo_in_header = request.show_logo_in_header
        if request.show_social_links is not None:
            branding.show_social_links = request.show_social_links
        if request.footer_text is not None:
            branding.footer_text = request.footer_text

        branding.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(branding)

        return {
            "success": True,
            "message": "Настройки брендинга успешно обновлены",
            "branding": {
                "id": branding.id,
                "logo_url": branding.logo_url,
                "primary_color": branding.primary_color,
                "secondary_color": branding.secondary_color,
                "accent_color": branding.accent_color,
                "company_name": branding.company_name,
                "updated_at": branding.updated_at.isoformat() if branding.updated_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class EmailPreviewRequest(BaseModel):
    press_release_title: str
    press_release_content: str


@app.post("/api/branding/preview-email")
async def preview_email(
    request: EmailPreviewRequest = Body(...),
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Предпросмотр email с применением брендинга
    """
    try:
        clerk_user_id = user_data.get("sub")
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

        branding = db.query(UserBranding).filter(UserBranding.user_id == user.id).first()

        branding_dict = None
        if branding:
            branding_dict = {
                'primary_color': branding.primary_color,
                'secondary_color': branding.secondary_color,
                'accent_color': branding.accent_color,
                'company_name': branding.company_name or user.email.split('@')[0],
                'company_tagline': branding.company_tagline,
                'contact_person': branding.contact_person,
                'contact_email': branding.contact_email or user.email,
                'contact_phone': branding.contact_phone,
                'website': branding.website,
                'logo_url': branding.logo_url,
                'linkedin_url': branding.linkedin_url,
                'twitter_url': branding.twitter_url,
                'facebook_url': branding.facebook_url,
                'instagram_url': branding.instagram_url,
                'youtube_url': branding.youtube_url,
                'telegram_url': branding.telegram_url,
                'email_signature': branding.email_signature,
                'default_closing': branding.default_closing,
                'show_logo_in_header': branding.show_logo_in_header,
                'show_social_links': branding.show_social_links,
                'footer_text': branding.footer_text,
            }

        # Генерируем HTML
        email_html = generate_email_html(
            press_release_title=request.press_release_title,
            press_release_content=request.press_release_content,
            branding=branding_dict
        )

        return {
            "html": email_html,
            "branding_applied": branding_dict is not None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint для обслуживания фронтенда
# @app.get("/{full_path:path}")
# async def serve_frontend(full_path: str):
#     """
#     Обслуживание статических файлов фронтенда
#     """
#     if full_path == "" or full_path == "/":
#         return FileResponse("../build/index.html")

#     file_path = f"../build/{full_path}"
#     if os.path.exists(file_path):
#         return FileResponse(file_path)
#     else:
#         # Для SPA - возвращаем index.html для всех неизвестных маршрутов
#         return FileResponse("../build/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)