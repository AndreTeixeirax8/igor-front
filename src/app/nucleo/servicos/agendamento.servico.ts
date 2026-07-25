import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { configuracaoApi } from '../configuracao/configuracao-api';
import {
  Agendamento,
  DadosCriacaoAgendamento,
  HorariosDia,
  PaginaAgendamentos,
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

  /**
   * Consulta os horários livres de um barbeiro para um serviço, entre duas
   * datas (formato "AAAA-MM-DD"). Devolve apenas os dias que têm horário livre.
   */
  horariosDisponiveis(
    idBarbeiro: number,
    idServico: number,
    inicio: string,
    fim: string,
  ): Observable<HorariosDia[]> {
    const parametros =
      `?id_barbeiro=${idBarbeiro}&id_servico=${idServico}` +
      `&inicio=${inicio}&fim=${fim}`;
    return this.clienteHttp.get<HorariosDia[]>(
      `${this.base}/horarios-disponiveis${parametros}`,
    );
  }

  /**
   * Lista uma página de agendamentos (GET /agendamentos). Somente gestores.
   *
   * @param pagina  Número da página (começa em 1).
   * @param tamanho Quantidade de itens por página.
   * @param status  Filtro opcional por situação; vazio = todas.
   */
  listarPagina(
    pagina: number,
    tamanho: number,
    status: '' | StatusAgendamento = '',
  ): Observable<PaginaAgendamentos> {
    const parametros =
      `?pagina=${pagina}&tamanho=${tamanho}` +
      (status !== '' ? `&status=${status}` : '');
    return this.clienteHttp.get<PaginaAgendamentos>(`${this.base}${parametros}`);
  }

  /**
   * Traz uma lista de agendamentos (somente gestores) para usos que só precisam
   * dos itens (ex.: o painel inicial). Busca uma página grande e devolve apenas
   * os itens, como faz a listagem de usuários.
   */
  listarTodos(): Observable<Agendamento[]> {
    return this.listarPagina(1, 100).pipe(map((pagina) => pagina.itens));
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
