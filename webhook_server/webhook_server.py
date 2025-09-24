from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse
import uvicorn
# import traceback
# from langsmith import traceable
# from graph import graphMW, graphRq, graphUC, graphDC, graphRv, graphIP
import os
import webhook_server_functions.miniworld_functions as mw_router
import webhook_server_functions.requirements_functions as rq_router
import webhook_server_functions.usecase_functions as uc_router
import webhook_server_functions.classdiagram_functions as dc_router
import webhook_server_functions.revision_functions as rv_router
import webhook_server_functions.interface_functions as ip_router

app = FastAPI()

# Incluir rota do minimundo
app.include_router(mw_router.router)
# Incluir rota das tabelas de requisitos
app.include_router(rq_router.router)
# Incluir rota dos casos de uso
app.include_router(uc_router.router)
# Incluir rota dos diagramas de classe
app.include_router(dc_router.router)
# Incluir rota da revisão
app.include_router(rv_router.router)
# Incluir rota do protótipo de interface
app.include_router(ip_router.router)

def uvicorn_run():
    uvicorn.run("webhook_server:app", host=f"0.0.0.0", port=8001, reload=True)

if __name__ == "__main__":
    uvicorn_run()