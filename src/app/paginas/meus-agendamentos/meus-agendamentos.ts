import { Component, inject, signal } from '@angular/core';

import { AgendamentoServico } from '../../nucleo/servicos/agendamento.servico';
import { ResolvedorNomesServico } from '../../nucleo/servicos/resolvedor-nomes.servico';
import {
  Agendamento,
  StatusAgendamento,
  rotuloStatus,
  statusEncerrado,
} from '../../nucleo/modelos/agendamento.modelo';
import { formatarDataHora } from '../../nucleo/util/data-hora';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';
import { Selo } from '../../compartilhado/selo/selo';

/**
 * Tela "Meus agendamentos": lista os agendamentos do usuário autenticado e
 * permite cancelar os que ainda estão em aberto.
 */
@Component({
  selector: 'app-meus-agendamentos',
  imports: [Selo],
  templateUrl: './meus-agendamentos.html',
  styleUrl: './meus-agendamentos.scss',
})
export class MeusAgendamentos {
  private readonly agendamentoServico = inject(AgendamentoServico);
  private readonly resolvedor = inject(ResolvedorNomesServico);

  /** Lista de agendamentos do usuário. */
  protected readonly agendamentos = signal<Agendamento[]>([]);

  /** Mapas id → nome, para exibir barbeiro e serviço em vez dos IDs. */
  protected readonly nomesBarbeiro = signal<Record<number, string | undefined>>({});
  protected readonly nomesServico = signal<Record<number, string | undefined>>({});

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
        this.resolverNomes(lista);
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
      error: (erro: unknown) => {
        this.cancelandoId.set(null);
        this.mensagemErro.set(
          mensagemDeErro(erro, 'Não foi possível cancelar o agendamento.'),
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

  /** Resolve os nomes de barbeiro e serviço de cada agendamento (com cache). */
  private resolverNomes(lista: Agendamento[]): void {
    for (const agendamento of lista) {
      this.resolvedor
        .nomeDoBarbeiro(agendamento.id_barbeiro)
        .subscribe((nome) =>
          this.nomesBarbeiro.update((m) => ({ ...m, [agendamento.id_barbeiro]: nome })),
        );
      this.resolvedor
        .nomeDoServico(agendamento.id_servico)
        .subscribe((nome) =>
          this.nomesServico.update((m) => ({ ...m, [agendamento.id_servico]: nome })),
        );
    }
  }
}
