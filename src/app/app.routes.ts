import { Routes } from '@angular/router';

import { autenticacaoGuarda } from './nucleo/guardas/autenticacao.guarda';
import { adminGuarda } from './nucleo/guardas/admin.guarda';
import { LayoutPainel } from './compartilhado/layout-painel/layout-painel';

/**
 * Rotas da aplicação. As páginas são carregadas sob demanda (lazy loading).
 *
 * Estrutura:
 *  - /login e /cadastro são telas públicas, fora do layout interno.
 *  - As demais telas ficam dentro do layout do painel (barra lateral + topo) e
 *    só são acessíveis para quem está autenticado:
 *      - /principal → painel (qualquer usuário autenticado);
 *      - /clientes  → lista de clientes (somente administradores).
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./paginas/login/login').then((modulo) => modulo.Login),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./paginas/cadastro/cadastro').then((modulo) => modulo.Cadastro),
  },
  {
    path: '',
    component: LayoutPainel,
    canActivate: [autenticacaoGuarda],
    children: [
      {
        path: 'principal',
        loadComponent: () =>
          import('./paginas/principal/principal').then(
            (modulo) => modulo.Principal,
          ),
      },
      {
        path: 'clientes',
        canActivate: [adminGuarda],
        loadComponent: () =>
          import('./paginas/clientes/clientes').then(
            (modulo) => modulo.Clientes,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'principal' },
    ],
  },
  { path: '**', redirectTo: '' },
];
