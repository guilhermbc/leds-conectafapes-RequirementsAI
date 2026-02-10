from django.apps import AppConfig

class ClassesConfig(AppConfig):
    name  = 'apps.classes'
    label = 'apps_classes'

    def ready(self):
        import apps.classes.signals
