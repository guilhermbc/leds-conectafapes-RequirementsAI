import { type RouteRecordRaw } from 'vue-router'

import { routes as projetoRoute } from './Projeto'
import { routes as moduloRoute } from './Modulo'
import { routes as documentoRoute } from './Documento'


export const routes: RouteRecordRaw[] = [
  ...projetoRoute,
  ...moduloRoute,
  ...documentoRoute,

]