import { Routes } from '@angular/router';

import { autenticacaoGuarda } from './nucleo/guardas/autenticacao.guarda';

/**
 * Rotas da aplicação. As páginas são carregadas sob demanda (lazy loading) para
 * manter o pacote inicial leve.
 *
 *  - /login     → tela de login (pública).
 *  - /principal → tela principal (protegida pelo guarda de autenticação).
 *  - qualquer outra rota cai no redirecionamento para /login.
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
    path: 'principal',
    canActivate: [autenticacaoGuarda],
    loadComponent: () =>
      import('./paginas/principal/principal').then(
        (modulo) => modulo.Principal,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'principal' },
  { path: '**', redirectTo: 'principal' },
];
