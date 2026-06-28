import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessaoServico } from '../servicos/sessao.servico';

/**
 * Guarda de rota da área de gestão: libera o acesso para administradores e
 * donos de barbearia. Os demais perfis são redirecionados para a tela principal.
 *
 * É uma proteção de interface; a proteção que realmente importa está no back-end.
 */
export const gestaoGuarda: CanActivateFn = () => {
  const sessao = inject(SessaoServico);
  const roteador = inject(Router);

  const perfil = sessao.usuario()?.perfil;
  if (perfil === 'admin' || perfil === 'dono') {
    return true;
  }

  return roteador.createUrlTree(['/principal']);
};
