import os

class Settings:
    def __init__(self):
        self.DB_USER = "cmms_user"
        self.DB_PASSWORD = "cmms_password"
        self.DB_HOST = "127.0.0.1"
        self.DB_PORT = "5433"
        self.DB_NAME = "cmms_db"
        self.SECRET_KEY = "clave_super_secreta_cambia_en_produccion"
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30

    @property
    def DATABASE_URL(self):
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

settings = Settings()