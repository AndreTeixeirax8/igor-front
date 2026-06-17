import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import { SessaoServico } from './sessao.servico';
import {
  CredenciaisLogin,
  RespostaAutenticacao,
} from '../modelos/autenticacao.modelo';

/**
 * Serviço de autenticação: conversa com as rotas /auth do back-end e delega ao
 * SessaoServico a guarda do token e dos dados do usuário.
 */
@Injectable({ providedIn: 'root' })
export class AutenticacaoServico {
  private readonly clienteHttp = inject(HttpClient);
  private readonly sessao = inject(SessaoServico);

  /**
   * Realiza o login enviando e-mail e senha para a API. Quando a resposta
   * chega com sucesso, inicia a sessão guardando o token e o usuário.
   *
   * @param credenciais E-mail e senha digitados na tela de login.
   * @returns Um Observable com a resposta de autenticação (token + usuário).
   */
  entrar(credenciais: CredenciaisLogin): Observable<RespostaAutenticacao> {
    const enderecoCompleto =
      configuracaoApi.enderecoBase + configuracaoApi.rotasAutenticacao.login;

    return this.clienteHttp
      .post<RespostaAutenticacao>(enderecoCompleto, credenciais)
      .pipe(
        tap((resposta) =>
          this.sessao.iniciarSessao(resposta.token, resposta.usuario),
        ),
      );
  }

  /**
   * Encerra a sessão do usuário atual (logout local).
   */
  sair(): void {
    this.sessao.encerrarSessao();
  }
}
