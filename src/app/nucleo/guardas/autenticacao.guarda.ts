import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessaoServico } from '../servicos/sessao.servico';

/**
 * Guarda de rota que só libera o acesso quando existe um usuário autenticado.
 * Caso contrário, redireciona para a tela de login. É usada para proteger a
 * tela principal e demais áreas internas do sistema.
 */
export const autenticacaoGuarda: CanActivateFn = () => {
  const sessao = inject(SessaoServico);
  const roteador = inject(Router);

  if (sessao.estaAutenticado()) {
    return true;
  }

  // Usuário não autenticado: manda para o login e bloqueia a navegação.
  return roteador.createUrlTree(['/login']);
};
