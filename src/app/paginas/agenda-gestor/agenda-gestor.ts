import { Component, inject, signal, computed } from '@angular/core';

import { AgendamentoServico } from '../../nucleo/servicos/agendamento.servico';
import { ResolvedorNomesServico } from '../../nucleo/servicos/resolvedor-nomes.servico';
import {
  Agendamento,
  StatusAgendamento,
  rotuloStatus,
} from '../../nucleo/modelos/agendamento.modelo';
import { formatarDataHora } from '../../nucleo/util/data-hora';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';
import { Selo } from '../../compartilhado/selo/selo';
import { Mensagem } from '../../compartilhado/mensagem/mensagem';

/** Uma ação de mudança de status disponível para um agendamento. */
interface AcaoStatus {
  status: StatusAgendamento;
  rotulo: string;
}

/**
 * Agenda do gestor (admin, dono ou barbeiro): lista todos os agendamentos e
 * permite avançar o status de cada um (confirmar, iniciar, concluir, marcar
 * como não compareceu ou cancelar).
 */
@Component({
  selector: 'app-agenda-gestor',
  imports: [Selo, Mensagem],
  templateUrl: './agenda-gestor.html',
  styleUrl: './agenda-gestor.scss',
})
export class AgendaGestor {
  private readonly agendamentoServico = inject(AgendamentoServico);
  private readonly resolvedor = inject(ResolvedorNomesServico);

  /** Lista completa de agendamentos. */
  private readonly agendamentos = signal<Agendamento[]>([]);

  /** Filtro por status ("todos" ou um status específico). */
  protected readonly filtro = signal<'todos' | StatusAgendamento>('todos');

  /** Mapas id → nome, preenchidos conforme as respostas chegam. */
  protected readonly nomesCliente = signal<Record<number, string | undefined>>({});
  protected readonly nomesBarbeiro = signal<Record<number, string | undefined>>({});
  protected readonly nomesServico = signal<Record<number, string | undefined>>({});

  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly atualizandoId = signal<number | null>(null);

  /** Opções do filtro exibidas na tela. */
  protected readonly opcoesFiltro: Array<{ valor: 'todos' | StatusAgendamento; rotulo: string }> = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'agendado', rotulo: 'Agendados' },
    { valor: 'confirmado', rotulo: 'Confirmados' },
    { valor: 'em_andamento', rotulo: 'Em andamento' },
    { valor: 'concluido', rotulo: 'Concluídos' },
    { valor: 'cancelado', rotulo: 'Cancelados' },
    { valor: 'nao_compareceu', rotulo: 'Não compareceu' },
  ];

  /** Transições de status permitidas a partir de cada status atual. */
  private readonly transicoes: Record<StatusAgendamento, AcaoStatus[]> = {
    agendado: [
      { status: 'confirmado', rotulo: 'Confirmar' },
      { status: 'nao_compareceu', rotulo: 'Não compareceu' },
      { status: 'cancelado', rotulo: 'Cancelar' },
    ],
    confirmado: [
      { status: 'em_andamento', rotulo: 'Iniciar' },
      { status: 'nao_compareceu', rotulo: 'Não compareceu' },
      { status: 'cancelado', rotulo: 'Cancelar' },
    ],
    em_andamento: [
      { status: 'concluido', rotulo: 'Concluir' },
      { status: 'cancelado', rotulo: 'Cancelar' },
    ],
    concluido: [],
    cancelado: [],
    nao_compareceu: [],
  };

  /** Agendamentos exibidos após aplicar o filtro. */
  protected readonly agendamentosFiltrados = computed(() => {
    const filtroAtual = this.filtro();
    if (filtroAtual === 'todos') {
      return this.agendamentos();
    }
    return this.agendamentos().filter((a) => a.status === filtroAtual);
  });

  constructor() {
    this.carregar();
  }

  /** Busca todos os agendamentos e resolve os nomes. */
  protected carregar(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.agendamentoServico.listarTodos().subscribe({
      next: (lista) => {
        this.agendamentos.set(lista);
        this.resolverNomes(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.mensagemErro.set('Não foi possível carregar a agenda.');
      },
    });
  }

  /** Aplica uma nova situação ao agendamento e atualiza a lista no lugar. */
  protected mudarStatus(agendamento: Agendamento, novoStatus: StatusAgendamento): void {
    this.atualizandoId.set(agendamento.id);
    this.mensagemErro.set('');

    this.agendamentoServico.atualizarStatus(agendamento.id, novoStatus).subscribe({
      next: (atualizado) => {
        this.atualizandoId.set(null);
        this.agendamentos.update((lista) =>
          lista.map((a) => (a.id === atualizado.id ? atualizado : a)),
        );
      },
      error: (erro: unknown) => {
        this.atualizandoId.set(null);
        this.mensagemErro.set(mensagemDeErro(erro, 'Não foi possível mudar o status.'));
      },
    });
  }

  /** Ações de status disponíveis para o status atual. */
  protected acoes(status: StatusAgendamento): AcaoStatus[] {
    return this.transicoes[status] ?? [];
  }

  protected rotulo(status: StatusAgendamento): string {
    return rotuloStatus(status);
  }

  protected formatar(dataIso: string): string {
    return formatarDataHora(dataIso);
  }

  /**
   * Dispara a resolução dos nomes (cliente, barbeiro, serviço) de cada
   * agendamento. O serviço resolvedor tem cache, então IDs repetidos não geram
   * novas chamadas.
   */
  private resolverNomes(lista: Agendamento[]): void {
    for (const agendamento of lista) {
      this.resolvedor
        .nomeDoUsuario(agendamento.id_cliente)
        .subscribe((nome) =>
          this.nomesCliente.update((m) => ({ ...m, [agendamento.id_cliente]: nome })),
        );
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
