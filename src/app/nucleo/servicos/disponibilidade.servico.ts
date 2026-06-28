import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import {
  Disponibilidade,
  DadosCriacaoDisponibilidade,
} from '../modelos/disponibilidade.modelo';

/**
 * Serviço que conversa com as rotas de disponibilidades (grade de horários).
 */
@Injectable({ providedIn: 'root' })
export class DisponibilidadeServico {
  private readonly clienteHttp = inject(HttpClient);
  private readonly endereco =
    configuracaoApi.enderecoBase + configuracaoApi.rotaDisponibilidades;

  /** Lista a grade de horários de um barbeiro. */
  listarPorBarbeiro(idBarbeiro: number): Observable<Disponibilidade[]> {
    return this.clienteHttp.get<Disponibilidade[]>(
      `${this.endereco}?id_barbeiro=${idBarbeiro}`,
    );
  }

  /** Adiciona uma faixa de horário (dono ou admin). */
  criar(dados: DadosCriacaoDisponibilidade): Observable<Disponibilidade> {
    return this.clienteHttp.post<Disponibilidade>(this.endereco, dados);
  }

  /** Remove uma faixa de horário (dono ou admin). */
  remover(id: number): Observable<void> {
    return this.clienteHttp.delete<void>(`${this.endereco}/${id}`);
  }
}
