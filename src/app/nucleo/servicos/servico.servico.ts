import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import { Servico, DadosCriacaoServico } from '../modelos/servico.modelo';

/**
 * Serviço que conversa com as rotas de serviços (corte, barba etc.) do back-end.
 */
@Injectable({ providedIn: 'root' })
export class ServicoServico {
  private readonly clienteHttp = inject(HttpClient);
  private readonly endereco =
    configuracaoApi.enderecoBase + configuracaoApi.rotaServicos;

  /** Lista os serviços de uma barbearia. */
  listarPorBarbearia(idBarbearia: number): Observable<Servico[]> {
    return this.clienteHttp.get<Servico[]>(
      `${this.endereco}?id_barbearia=${idBarbearia}`,
    );
  }

  /** Busca um serviço pelo ID. */
  buscarPorId(id: number): Observable<Servico> {
    return this.clienteHttp.get<Servico>(`${this.endereco}/${id}`);
  }

  /** Cadastra um novo serviço (dono ou admin). */
  criar(dados: DadosCriacaoServico): Observable<Servico> {
    return this.clienteHttp.post<Servico>(this.endereco, dados);
  }
}
