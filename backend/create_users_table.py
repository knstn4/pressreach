"""
Создание таблицы users в базе данных
"""
from database import Base, engine, User, PlanType
from sqlalchemy.orm import sessionmaker

def create_users_table():
    """Создать таблицу users"""
    print("Создание таблицы users...")

    # Создаем таблицу
    Base.metadata.create_all(engine, tables=[User.__table__])

    print("✅ Таблица users успешно создана!")

if __name__ == "__main__":
    create_users_table()
