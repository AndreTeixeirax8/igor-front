import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import { Barbeiro, DadosCriacaoBarbeiro } from '../modelos/barbeiro.modelo';

/**
 * Serviço que conversa com as rotas de barbeiros do back-end.
 */
@Injectable({ providedIn: 'root' })
export class BarbeiroServico {
  private readonly clienteHttp = inject(HttpClient);
  private readonly endereco =
    configuracaoApi.enderecoBase + configuracaoApi.rotaBarbeiros;

  /** Lista os barbeiros de uma barbearia. */
  listarPorBarbearia(idBarbearia: number): Observable<Barbeiro[]> {
    return this.clienteHttp.get<Barbeiro[]>(
      `${this.endereco}?id_barbearia=${idBarbearia}`,
    );
  }

  /** Busca um barbeiro pelo ID. */
  buscarPorId(id: number): Observable<Barbeiro> {
    return this.clienteHttp.get<Barbeiro>(`${this.endereco}/${id}`);
  }

  /** Cadastra um novo barbeiro (dono ou admin). */
  criar(dados: DadosCriacaoBarbeiro): Observable<Barbeiro> {
    return this.clienteHttp.post<Barbeiro>(this.endereco, dados);
  }
}
