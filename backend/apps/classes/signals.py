from .models import Projeto, Modulo, Documento
from django.db.models.signals import (
    pre_init,   post_init,
    pre_save,   post_save,
    pre_delete, post_delete,
    m2m_changed
)
from django.dispatch import receiver
from django.contrib.auth.models import Group

## Signals from Projeto
@receiver(pre_init, sender=Projeto)
def pre_init_projeto(sender, *args, **kwargs):
    pass

@receiver(post_init, sender=Projeto)
def post_init_projeto(sender, instance, **kwargs):
    pass

@receiver(pre_save, sender=Projeto)
def pre_save_projeto(sender, instance, raw, using, update_fields, **kwargs):
    pass

@receiver(post_save, sender=Projeto)
def post_save_projeto(sender, instance, created, raw, using, update_fields, **kwargs):
    pass

@receiver(pre_delete, sender=Projeto)
def pre_delete_projeto(sender, instance, using, **kwargs):
    pass

@receiver(post_delete, sender=Projeto)
def post_delete_projeto(sender, instance, using, **kwargs):
    pass

@receiver(m2m_changed, sender=Projeto)
def m2m_changed_projeto(sender, instance, action, reverse, model, pk_set, using, **kwargs):
    pass

## Signals from Modulo
@receiver(pre_init, sender=Modulo)
def pre_init_modulo(sender, *args, **kwargs):
    pass

@receiver(post_init, sender=Modulo)
def post_init_modulo(sender, instance, **kwargs):
    pass

@receiver(pre_save, sender=Modulo)
def pre_save_modulo(sender, instance, raw, using, update_fields, **kwargs):
    pass

@receiver(post_save, sender=Modulo)
def post_save_modulo(sender, instance, created, raw, using, update_fields, **kwargs):
    pass

@receiver(pre_delete, sender=Modulo)
def pre_delete_modulo(sender, instance, using, **kwargs):
    pass

@receiver(post_delete, sender=Modulo)
def post_delete_modulo(sender, instance, using, **kwargs):
    pass

@receiver(m2m_changed, sender=Modulo)
def m2m_changed_modulo(sender, instance, action, reverse, model, pk_set, using, **kwargs):
    pass

## Signals from Documento
@receiver(pre_init, sender=Documento)
def pre_init_documento(sender, *args, **kwargs):
    pass

@receiver(post_init, sender=Documento)
def post_init_documento(sender, instance, **kwargs):
    pass

@receiver(pre_save, sender=Documento)
def pre_save_documento(sender, instance, raw, using, update_fields, **kwargs):
    pass

@receiver(post_save, sender=Documento)
def post_save_documento(sender, instance, created, raw, using, update_fields, **kwargs):
    pass

@receiver(pre_delete, sender=Documento)
def pre_delete_documento(sender, instance, using, **kwargs):
    pass

@receiver(post_delete, sender=Documento)
def post_delete_documento(sender, instance, using, **kwargs):
    pass

@receiver(m2m_changed, sender=Documento)
def m2m_changed_documento(sender, instance, action, reverse, model, pk_set, using, **kwargs):
    pass
