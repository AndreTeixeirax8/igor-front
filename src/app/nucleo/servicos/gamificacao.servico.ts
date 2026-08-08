import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import {
  ProgressoGamificacao,
  MovimentacaoPontos,
  Nivel,
} from '../modelos/gamificacao.modelo';

/**
 * Serviço que conversa com as rotas de gamificação do back-end.
 *
 * Todo o cálculo de nível e de barra de progresso é feito no servidor; aqui só
 * buscamos os números prontos.
 */
@Injectable({ providedIn: 'root' })
export class GamificacaoServico {
  private readonly clienteHttp = inject(HttpClient);

  /** Progresso do usuário autenticado (XP, saldo, nível e quanto falta). */
  meuProgresso(): Observable<ProgressoGamificacao> {
    return this.clienteHttp.get<ProgressoGamificacao>(
      configuracaoApi.enderecoBase + configuracaoApi.rotasGamificacao.meuProgresso,
    );
  }

  /** Últimas movimentações de pontos do usuário autenticado. */
  meuExtrato(): Observable<MovimentacaoPontos[]> {
    return this.clienteHttp.get<MovimentacaoPontos[]>(
      configuracaoApi.enderecoBase + configuracaoApi.rotasGamificacao.meuExtrato,
    );
  }

  /** Escada completa de níveis (para mostrar o caminho até o topo). */
  listarNiveis(): Observable<Nivel[]> {
    return this.clienteHttp.get<Nivel[]>(
      configuracaoApi.enderecoBase + configuracaoApi.rotasGamificacao.niveis,
    );
  }
}
