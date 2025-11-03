# How to run: Backend

Ir para a pasta `backend`
```bash
cd backend
```

Criar as migrações
```bash
python manage.py makemigrations
```

Executar as migrações
```bash
python manage.py migrate
```

Executar servidor de desenvolvimento
```bash
python manage.py runserver
```

## Exemplo de Uso das Rotas
### Projeto
```json
{
  "nome": "projeto 1",
  "descricao": "descricao do projeto 1"
}
```

### Modulo
```json
{
  "nome": "modulo 1",
  "descricao": "descricao do modulo 1",
  "Projeto": 1
}
```

### Documento
#### Minimundo
```json
{
  "versao": "1.0",
  "arquivo": "",
  "origemAudio": "AudioEntrevistaFelipe.mp3",
  "TipoDocumento": "MINIMUNDO",
  "DocumentoAnterior": null,
  "Modulo": 1,
  "DocumentoOrigem": []
}
```

#### Requisitos
```json
{
  "versao": "1.0",
  "arquivo": "",
  "origemAudio": "",
  "TipoDocumento": "REQUISITOS",
  "DocumentoAnterior": null,
  "Modulo": 1,
  "DocumentoOrigem": [
  1
]
}
```

#### Caso de Uso
```json
{
  "versao": "1.0",
  "arquivo": "",
  "origemAudio": "",
  "TipoDocumento": "CASO_USO",
  "DocumentoAnterior": null,
  "Modulo": 1,
  "DocumentoOrigem": [
  1, 2
]
}
```

#### Diagrama de Classe
```json
{
  "versao": "1.0",
  "arquivo": "",
  "origemAudio": "",
  "TipoDocumento": "DIAGRAMA_CLASSE",
  "DocumentoAnterior": null,
  "Modulo": 1,
  "DocumentoOrigem": [
  1, 2, 3
]
}
```

#### Projeto de Interface
```json
{
  "versao": "1.0",
  "arquivo": "",
  "origemAudio": "",
  "TipoDocumento": "PROTOTIPO_INTERFACE",
  "DocumentoAnterior": null,
  "Modulo": 1,
  "DocumentoOrigem": [
  2, 3, 4
]
}
```