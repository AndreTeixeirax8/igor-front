import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { SessaoServico } from '../servicos/sessao.servico';

/**
 * Interceptador de requisições HTTP. Para toda requisição enviada à API, se
 * houver um usuário autenticado, anexa automaticamente o cabeçalho
 * "Authorization: Bearer <token>" — formato exigido pelo middleware do back-end.
 */
export const tokenInterceptador: HttpInterceptorFn = (requisicao, proximo) => {
  const sessao = inject(SessaoServico);
  const token = sessao.obterToken();

  // Sem token (usuário não autenticado): segue a requisição como está.
  if (!token) {
    return proximo(requisicao);
  }

  // Clona a requisição adicionando o cabeçalho de autenticação.
  const requisicaoAutenticada = requisicao.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return proximo(requisicaoAutenticada);
};
