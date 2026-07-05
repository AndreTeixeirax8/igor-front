import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessaoServico } from '../servicos/sessao.servico';

/**
 * Guarda da área de gestor: libera o acesso para administradores, donos e
 * barbeiros (os perfis que operam a agenda da barbearia). Os demais são
 * redirecionados para a tela principal.
 *
 * É uma proteção de interface; a proteção que importa está no back-end.
 */
export const gestorGuarda: CanActivateFn = () => {
  const sessao = inject(SessaoServico);
  const roteador = inject(Router);

  const perfil = sessao.usuario()?.perfil;
  if (perfil === 'admin' || perfil === 'dono' || perfil === 'barbeiro') {
    return true;
  }

  return roteador.createUrlTree(['/principal']);
};
