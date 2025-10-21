import logging
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

load_dotenv()


class OpenRouterClient:
    def __init__(self):
        self.api_key = os.environ.get("DEEPSEEK_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        self.client = AsyncOpenAI(base_url=self.base_url, api_key=self.api_key, timeout=20)
        self.default_model = "deepseek/deepseek-chat-v3.1"
        self.headers = {
            "HTTP-Referer": "https://obuchai.com",  # Optional: Your site URL
            "X-Title": "Obuchai.com"  # Optional: Your site title
        }

    async def generate_press_release(self, user_prompt: str, model: str = None, models: list = None) -> str:
        """
        Generate a press release using the OpenAI SDK.

        Args:
            user_prompt: User prompt for press release generation.
            model: Model key, e.g., deepseek, gpt5o (deprecated, use models instead).
            models: List of model keys to try in order.

        Returns:
            str: Generated press release text.

        Raises:
            Exception: If the model fails.
        """
        model_mapping = {
            "deepseek": "deepseek/deepseek-chat-v3.1",
            "gpt5": "anthropic/claude-sonnet-4",
            "claude4": "anthropic/claude-sonnet-4"
        }

        # Determine which models to try
        if models and isinstance(models, list):
            models_to_try = []
            for m in models:
                mapped_model = model_mapping.get(m, m)
                models_to_try.append(mapped_model)
        elif model:
            primary_model = model_mapping.get(model, self.default_model)
            models_to_try = [primary_model]
        else:
            models_to_try = [self.default_model]

        try:
            from prompts import SYSTEM_PROMPT
        except ImportError:
            from .prompts import SYSTEM_PROMPT
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        last_error = None

        for i, model_to_try in enumerate(models_to_try):
            try:
                logger.info(f"Trying model {i+1}/{len(models_to_try)}: {model_to_try}")

                completion = await self.client.chat.completions.create(
                    extra_headers=self.headers,
                    model=model_to_try,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2000  # Увеличено для пресс-релизов
                )

                generated_text = completion.choices[0].message.content.strip()
                logger.info(f"Successfully received response from {model_to_try}")

                return generated_text

            except Exception as e:
                logger.error(f"Error with model {model_to_try}: {str(e)}")
                last_error = e

        # If we get here, all models failed
        logger.error(f"All models failed. Last error: {str(last_error)}")
        raise Exception(f"Model failed: {str(last_error)}")

    async def improve_text(self, user_prompt: str, system_prompt: str = None, model: str = None):
        """
        Улучшает текст (проверка грамматики или переписывание)
        """
        model_mapping = {
            "deepseek": "deepseek/deepseek-chat",
            "gpt4": "openai/gpt-4-turbo-preview",
            "gpt35": "openai/gpt-3.5-turbo",
            "claude": "anthropic/claude-2",
        }

        models_to_try = []
        if isinstance(model, list):
            for m in model:
                mapped_model = model_mapping.get(m, m)
                models_to_try.append(mapped_model)
        elif model:
            primary_model = model_mapping.get(model, self.default_model)
            models_to_try = [primary_model]
        else:
            models_to_try = [self.default_model]

        # Используем специальный системный промпт для улучшения текста
        if system_prompt is None:
            try:
                from prompts import TEXT_IMPROVEMENT_SYSTEM_PROMPT
                system_prompt = TEXT_IMPROVEMENT_SYSTEM_PROMPT
            except ImportError:
                from .prompts import TEXT_IMPROVEMENT_SYSTEM_PROMPT
                system_prompt = TEXT_IMPROVEMENT_SYSTEM_PROMPT

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        last_error = None

        for i, model_to_try in enumerate(models_to_try):
            try:
                logger.info(f"Trying model {i+1}/{len(models_to_try)}: {model_to_try}")

                completion = await self.client.chat.completions.create(
                    extra_headers=self.headers,
                    model=model_to_try,
                    messages=messages,
                    temperature=0.3,  # Более низкая температура для точности
                    max_tokens=3000
                )

                generated_text = completion.choices[0].message.content.strip()
                logger.info(f"Successfully received response from {model_to_try}")

                return generated_text

            except Exception as e:
                logger.error(f"Error with model {model_to_try}: {str(e)}")
                last_error = e

        # If we get here, all models failed
        logger.error(f"All models failed. Last error: {str(last_error)}")
        raise Exception(f"Model failed: {str(last_error)}")
