#!/usr/bin/env python3
"""
Скрипт для добавления таблицы distribution_files в базу данных
"""
from database import Base, engine, DistributionFile
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_distribution_files_table():
    """Создать таблицу distribution_files"""
    try:
        # Создаём только таблицу DistributionFile
        DistributionFile.__table__.create(engine, checkfirst=True)
        logger.info("✅ Таблица distribution_files успешно создана!")
    except Exception as e:
        logger.error(f"❌ Ошибка при создании таблицы: {e}")
        raise

if __name__ == "__main__":
    print("🔧 Создание таблицы distribution_files...")
    create_distribution_files_table()
    print("✅ Готово!")
