from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from core.config import get_settings
import os

settings = get_settings()

# Ensure SQLite directory exists
if "sqlite" in settings.database_url:
    db_clean_path = settings.database_url.replace("sqlite:///", "").replace("sqlite://", "")
    db_dir = os.path.dirname(db_clean_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_async_engine(
    settings.database_url.replace("sqlite:///", "sqlite+aiosqlite:///"),
    echo=False,
    future=True
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def init_db():
    # Explicitly import all models so Base.metadata is fully populated
    from models.setting import Setting  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
