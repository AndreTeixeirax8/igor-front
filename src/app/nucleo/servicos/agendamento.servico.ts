import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import {
  Agendamento,
  DadosCriacaoAgendamento,
  StatusAgendamento,
} from '../modelos/agendamento.modelo';

/**
 * Serviço que conversa com as rotas de agendamentos do back-end.
 */
@Injectable({ providedIn: 'root' })
export class AgendamentoServico {
  private readonly clienteHttp = inject(HttpClient);
  private readonly base =
    configuracaoApi.enderecoBase + configuracaoApi.rotasAgendamento.base;
  private readonly enderecoMeus =
    configuracaoApi.enderecoBase + configuracaoApi.rotasAgendamento.meus;

  /** Cria um agendamento (o cliente é o usuário autenticado). */
  criar(dados: DadosCriacaoAgendamento): Observable<Agendamento> {
    return this.clienteHttp.post<Agendamento>(this.base, dados);
  }

  /** Lista os agendamentos do usuário autenticado. */
  listarMeus(): Observable<Agendamento[]> {
    return this.clienteHttp.get<Agendamento[]>(this.enderecoMeus);
  }

  /** Lista todos os agendamentos (somente gestores). */
  listarTodos(): Observable<Agendamento[]> {
    return this.clienteHttp.get<Agendamento[]>(this.base);
  }

  /** Cancela um agendamento (dono do agendamento ou gestor). */
  cancelar(id: number, motivo?: string | null): Observable<Agendamento> {
    return this.clienteHttp.patch<Agendamento>(`${this.base}/${id}/cancelar`, {
      motivo: motivo ?? null,
    });
  }

  /** Muda o status de um agendamento (somente gestores). */
  atualizarStatus(
    id: number,
    status: StatusAgendamento,
    motivo?: string | null,
  ): Observable<Agendamento> {
    return this.clienteHttp.patch<Agendamento>(`${this.base}/${id}/status`, {
      status,
      motivo: motivo ?? null,
    });
  }
}
