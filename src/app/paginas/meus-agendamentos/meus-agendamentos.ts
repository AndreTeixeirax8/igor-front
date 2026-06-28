import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AgendamentoServico } from '../../nucleo/servicos/agendamento.servico';
import {
  Agendamento,
  StatusAgendamento,
  rotuloStatus,
  statusEncerrado,
} from '../../nucleo/modelos/agendamento.modelo';
import { formatarDataHora } from '../../nucleo/util/data-hora';

/**
 * Tela "Meus agendamentos": lista os agendamentos do usuário autenticado e
 * permite cancelar os que ainda estão em aberto.
 */
@Component({
  selector: 'app-meus-agendamentos',
  imports: [],
  templateUrl: './meus-agendamentos.html',
  styleUrl: './meus-agendamentos.scss',
})
export class MeusAgendamentos {
  private readonly agendamentoServico = inject(AgendamentoServico);

  /** Lista de agendamentos do usuário. */
  protected readonly agendamentos = signal<Agendamento[]>([]);

  /** Indica que a lista está sendo carregada. */
  protected readonly carregando = signal(true);

  /** Mensagem de erro (carregamento ou cancelamento); vazia quando não há. */
  protected readonly mensagemErro = signal('');

  /** ID do agendamento sendo cancelado no momento (para desabilitar o botão). */
  protected readonly cancelandoId = signal<number | null>(null);

  constructor() {
    this.carregar();
  }

  /** Busca os agendamentos do usuário na API. */
  protected carregar(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.agendamentoServico.listarMeus().subscribe({
      next: (lista) => {
        this.agendamentos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.mensagemErro.set('Não foi possível carregar seus agendamentos.');
      },
    });
  }

  /** Cancela um agendamento e recarrega a lista. */
  protected cancelar(agendamento: Agendamento): void {
    const confirmou = confirm(
      'Tem certeza que deseja cancelar este agendamento?',
    );
    if (!confirmou) {
      return;
    }

    this.cancelandoId.set(agendamento.id);
    this.mensagemErro.set('');

    this.agendamentoServico.cancelar(agendamento.id).subscribe({
      next: () => {
        this.cancelandoId.set(null);
        this.carregar();
      },
      error: (erro: HttpErrorResponse) => {
        this.cancelandoId.set(null);
        this.mensagemErro.set(
          erro.error?.erro ?? 'Não foi possível cancelar o agendamento.',
        );
      },
    });
  }

  /** Rótulo amigável do status. */
  protected rotulo(status: StatusAgendamento): string {
    return rotuloStatus(status);
  }

  /** Indica se o agendamento já está encerrado (não pode cancelar). */
  protected encerrado(status: StatusAgendamento): boolean {
    return statusEncerrado(status);
  }

  /** Formata uma data ISO para exibição. */
  protected formatar(dataIso: string): string {
    return formatarDataHora(dataIso);
  }
}
