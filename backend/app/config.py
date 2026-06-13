from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "云上田园 - Cloud Farm"
    DATABASE_URL: str = "sqlite+aiosqlite:///./cloud_farm.db"

    # AI Provider: "glm" | "deepseek" | "" (空=使用本地模板)
    AI_PROVIDER: str = ""

    # 智谱 GLM 配置 (https://open.bigmodel.cn/)
    GLM_API_KEY: str = ""
    GLM_MODEL: str = "glm-4-flash"
    GLM_VISION_MODEL: str = "glm-4v-flash"

    # DeepSeek 配置 (https://platform.deepseek.com/)
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-chat"

    # 小米 MiMo 配置 (https://platform.xiaomimimo.com/)
    MIMO_API_KEY: str = ""
    MIMO_MODEL: str = "mimo-v2.5"

    WEATHER_API_BASE: str = "https://api.open-meteo.com/v1"
    DEFAULT_LATITUDE: float = 30.50
    DEFAULT_LONGITUDE: float = 114.34
    SENSOR_UPDATE_INTERVAL: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()