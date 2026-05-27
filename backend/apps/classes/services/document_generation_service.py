from utils import (
    send_to_llm
)

class DocumentoGenerationService:

    @staticmethod
    def generate(
        *,
        data,
        user,
        job=None
    ):
        """
        Executa toda a lógica de geração
        de documentos.
        """

        #
        # aqui vai a lógica que hoje
        # está no create()
        #

        return {
            "success": True
        }