import { Routes } from '@angular/router';

import { autenticacaoGuarda } from './nucleo/guardas/autenticacao.guarda';
import { gestaoGuarda } from './nucleo/guardas/gestao.guarda';
import { gestorGuarda } from './nucleo/guardas/gestor.guarda';
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
        path: 'agendar',
        loadComponent: () =>
          import('./paginas/agendar/agendar').then((modulo) => modulo.Agendar),
      },
      {
        path: 'meus-agendamentos',
        loadComponent: () =>
          import('./paginas/meus-agendamentos/meus-agendamentos').then(
            (modulo) => modulo.MeusAgendamentos,
          ),
      },
      {
        path: 'agenda',
        canActivate: [gestorGuarda],
        loadComponent: () =>
          import('./paginas/agenda-gestor/agenda-gestor').then(
            (modulo) => modulo.AgendaGestor,
          ),
      },
      {
        path: 'clientes',
        canActivate: [gestaoGuarda],
        loadComponent: () =>
          import('./paginas/clientes/clientes').then(
            (modulo) => modulo.Clientes,
          ),
      },
      {
        path: 'gestao',
        canActivate: [gestaoGuarda],
        loadComponent: () =>
          import('./paginas/gestao/gestao').then((modulo) => modulo.Gestao),
      },
      { path: '', pathMatch: 'full', redirectTo: 'principal' },
    ],
  },
  { path: '**', redirectTo: '' },
];
