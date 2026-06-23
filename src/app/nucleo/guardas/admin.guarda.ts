import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessaoServico } from '../servicos/sessao.servico';

/**
 * Guarda de rota que só libera o acesso para usuários com perfil de
 * administrador. Usada em áreas restritas, como a listagem de clientes.
 *
 * Quem não for administrador é redirecionado para a tela principal. Esta é uma
 * proteção de interface; a proteção que realmente importa está no back-end, que
 * recusa a requisição (403) caso o usuário não seja admin.
 */
export const adminGuarda: CanActivateFn = () => {
  const sessao = inject(SessaoServico);
  const roteador = inject(Router);

  const usuario = sessao.usuario();
  if (usuario?.perfil === 'admin') {
    return true;
  }

  return roteador.createUrlTree(['/principal']);
};
