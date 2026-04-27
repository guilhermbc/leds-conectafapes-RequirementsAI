from django.conf import settings
from django.db import models
from cryptography.fernet import Fernet

cipher = Fernet(settings.SECRET_KEY)
class EncryptedTextField(models.TextField):

    def get_prep_value(self, value):
        if value is None:
            return value
        return cipher.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return cipher.decrypt(value.encode()).decode()

    def to_python(self, value):
        if value is None:
            return value
        try:
            return cipher.decrypt(value.encode()).decode()
        except Exception:
            return value