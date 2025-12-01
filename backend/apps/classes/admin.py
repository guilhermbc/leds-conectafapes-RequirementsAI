from django.contrib import admin
from .models import Projeto,Modulo,Documento

@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'descricao']
    list_display_links = ['id', 'nome', 'descricao']
    search_fields = ['id', 'nome', 'descricao']
    list_per_page = 25
    ordering = ['-id']

@admin.register(Modulo)
class ModuloAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'descricao']
    list_display_links = ['id', 'nome', 'descricao']
    search_fields = ['id', 'nome', 'descricao']
    list_per_page = 25
    ordering = ['-id']

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ['id', 'vMajor', 'vMinor', 'arquivo']
    list_display_links = ['id', 'vMajor', 'vMinor', 'arquivo']
    search_fields = ['id', 'vMajor', 'vMinor', 'arquivo']
    list_per_page = 25
    ordering = ['-id']

