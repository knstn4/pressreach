"""
Clerk Authentication для FastAPI
"""
import os
import jwt
import requests
from typing import Optional
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import lru_cache
from jwt import PyJWKClient

# Security scheme
security = HTTPBearer()

# Получаем Secret Key из переменных окружения
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")

# Извлекаем publishable key для получения правильного JWKS URL
# Clerk JWKS URL имеет формат: https://[clerk-domain]/.well-known/jwks.json
# Для этого нам нужен либо publishable key либо домен


def get_jwks_url_from_secret_key(secret_key: str) -> str:
    """
    Получить JWKS URL из Clerk API используя Secret Key
    """
    # Для большинства Clerk приложений JWKS находится по стандартному URL
    # Мы можем извлечь домен из Secret Key или использовать Clerk API

    # Попробуем получить информацию через API
    headers = {"Authorization": f"Bearer {secret_key}"}
    try:
        # Получаем информацию о приложении
        response = requests.get("https://api.clerk.com/v1/jwks", headers=headers, timeout=5)
        if response.status_code == 200:
            return "https://api.clerk.com/v1/jwks"
    except:
        pass

    # Если не получилось, возвращаем None
    return None


def verify_clerk_token(token: str) -> dict:
    """
    Проверяет JWT токен от Clerk с полной верификацией подписи

    Args:
        token: JWT токен из Authorization header

    Returns:
        dict: Декодированные данные пользователя

    Raises:
        HTTPException: Если токен невалиден
    """
    if not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="CLERK_SECRET_KEY not configured")

    try:
        # Сначала декодируем без проверки, чтобы получить issuer
        unverified = jwt.decode(token, options={"verify_signature": False})
        issuer = unverified.get("iss", "")

        # JWKS URL должен быть issuer + /.well-known/jwks.json
        if issuer:
            jwks_url = f"{issuer}/.well-known/jwks.json"
        else:
            raise HTTPException(status_code=401, detail="Token missing issuer")

        # Используем PyJWKClient для получения ключей
        jwks_client = PyJWKClient(jwks_url, cache_keys=True)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Теперь верифицируем токен с правильным ключом
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": False,  # Clerk токены могут не иметь audience
            }
        )

        return decoded

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Dependency для получения текущего пользователя из JWT токена

    Usage:
        @app.get("/protected")
        async def protected_route(user = Depends(get_current_user)):
            return {"user_id": user["sub"]}
    """
    token = credentials.credentials
    user_data = verify_clerk_token(token)
    return user_data


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Optional[dict]:
    """
    Опциональная авторизация - возвращает None если токена нет
    """
    if not credentials:
        return None

    try:
        token = credentials.credentials
        user_data = verify_clerk_token(token)
        return user_data
    except:
        return None
