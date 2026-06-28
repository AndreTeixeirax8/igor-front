import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { BarbeariaServico } from '../../nucleo/servicos/barbearia.servico';
import { BarbeiroServico } from '../../nucleo/servicos/barbeiro.servico';
import { ServicoServico } from '../../nucleo/servicos/servico.servico';
import { DisponibilidadeServico } from '../../nucleo/servicos/disponibilidade.servico';
import { AgendamentoServico } from '../../nucleo/servicos/agendamento.servico';
import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';

import { Barbearia } from '../../nucleo/modelos/barbearia.modelo';
import { Barbeiro } from '../../nucleo/modelos/barbeiro.modelo';
import { Servico } from '../../nucleo/modelos/servico.modelo';
import { Disponibilidade, nomeDiaSemana } from '../../nucleo/modelos/disponibilidade.modelo';
import { paraRFC3339ComFusoLocal } from '../../nucleo/util/data-hora';

/**
 * Tela de agendamento do cliente. Conduz a escolha em etapas:
 * barbearia → barbeiro → serviço → data/hora, e então cria o agendamento.
 */
@Component({
  selector: 'app-agendar',
  imports: [FormsModule],
  templateUrl: './agendar.html',
  styleUrl: './agendar.scss',
})
export class Agendar {
  private readonly barbeariaServico = inject(BarbeariaServico);
  private readonly barbeiroServico = inject(BarbeiroServico);
  private readonly servicoServico = inject(ServicoServico);
  private readonly disponibilidadeServico = inject(DisponibilidadeServico);
  private readonly agendamentoServico = inject(AgendamentoServico);
  private readonly usuarioServico = inject(UsuarioServico);
  private readonly roteador = inject(Router);

  /** Listas carregadas da API. */
  protected readonly barbearias = signal<Barbearia[]>([]);
  protected readonly barbeiros = signal<Barbeiro[]>([]);
  protected readonly servicos = signal<Servico[]>([]);
  protected readonly disponibilidades = signal<Disponibilidade[]>([]);

  /** Mapa id do barbeiro → nome do usuário, para exibição. */
  protected readonly nomesBarbeiros = signal<Record<number, string>>({});

  /** Seleções feitas pelo usuário. */
  protected readonly barbeariaSelecionadaId = signal<number | null>(null);
  protected readonly barbeiroSelecionadoId = signal<number | null>(null);
  protected readonly servicoSelecionadoId = signal<number | null>(null);

  /** Campos do passo final. */
  protected dataHora = signal('');
  protected observacoes = signal('');

  /** Estado de envio e mensagens. */
  protected readonly enviando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly mensagemSucesso = signal('');

  /** Serviço atualmente selecionado (objeto completo), para o resumo. */
  protected readonly servicoSelecionado = computed(() =>
    this.servicos().find((servico) => servico.id === this.servicoSelecionadoId()),
  );

  /** Indica se já é possível concluir o agendamento. */
  protected readonly podeAgendar = computed(
    () =>
      this.barbeiroSelecionadoId() !== null &&
      this.servicoSelecionadoId() !== null &&
      this.dataHora().trim() !== '',
  );

  constructor() {
    this.carregarBarbearias();
  }

  /** Carrega a lista de barbearias disponíveis. */
  private carregarBarbearias(): void {
    this.barbeariaServico.listar().subscribe({
      next: (lista) => this.barbearias.set(lista),
      error: () =>
        this.mensagemErro.set('Não foi possível carregar as barbearias.'),
    });
  }

  /**
   * Ao escolher uma barbearia, carrega seus barbeiros e serviços e zera as
   * escolhas seguintes.
   */
  protected selecionarBarbearia(idBarbearia: number): void {
    this.barbeariaSelecionadaId.set(idBarbearia);
    this.barbeiroSelecionadoId.set(null);
    this.servicoSelecionadoId.set(null);
    this.disponibilidades.set([]);
    this.mensagemSucesso.set('');

    this.barbeiroServico.listarPorBarbearia(idBarbearia).subscribe({
      next: (lista) => {
        this.barbeiros.set(lista);
        this.carregarNomesDosBarbeiros(lista);
      },
      error: () => this.mensagemErro.set('Falha ao carregar os barbeiros.'),
    });

    this.servicoServico.listarPorBarbearia(idBarbearia).subscribe({
      next: (lista) => this.servicos.set(lista),
      error: () => this.mensagemErro.set('Falha ao carregar os serviços.'),
    });
  }

  /** Ao escolher um barbeiro, carrega a grade de horários dele. */
  protected selecionarBarbeiro(idBarbeiro: number): void {
    this.barbeiroSelecionadoId.set(idBarbeiro);

    this.disponibilidadeServico.listarPorBarbeiro(idBarbeiro).subscribe({
      next: (lista) => this.disponibilidades.set(lista),
      error: () => this.disponibilidades.set([]),
    });
  }

  /** Marca o serviço escolhido. */
  protected selecionarServico(idServico: number): void {
    this.servicoSelecionadoId.set(idServico);
  }

  /** Cria o agendamento com as escolhas feitas. */
  protected agendar(): void {
    if (!this.podeAgendar()) {
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const observacoesInformadas = this.observacoes().trim();

    this.agendamentoServico
      .criar({
        id_barbeiro: this.barbeiroSelecionadoId()!,
        id_servico: this.servicoSelecionadoId()!,
        inicio_em: paraRFC3339ComFusoLocal(this.dataHora()),
        observacoes: observacoesInformadas === '' ? null : observacoesInformadas,
      })
      .subscribe({
        next: () => {
          // Sucesso: leva o cliente para a lista dos seus agendamentos.
          this.roteador.navigate(['/meus-agendamentos']);
        },
        error: (erro: HttpErrorResponse) => {
          this.enviando.set(false);
          this.mensagemErro.set(
            erro.error?.erro ?? 'Não foi possível concluir o agendamento.',
          );
        },
      });
  }

  /** Nome do barbeiro (ou um rótulo padrão enquanto o nome não chega). */
  protected nomeBarbeiro(barbeiro: Barbeiro): string {
    return this.nomesBarbeiros()[barbeiro.id] ?? `Barbeiro #${barbeiro.id}`;
  }

  /** Nome do dia da semana (para exibir a grade). */
  protected nomeDoDia(diaSemana: number): string {
    return nomeDiaSemana(diaSemana);
  }

  /**
   * Busca o nome do usuário de cada barbeiro para exibir na lista. Em caso de
   * erro em algum, mantém o rótulo padrão.
   */
  private carregarNomesDosBarbeiros(barbeiros: Barbeiro[]): void {
    for (const barbeiro of barbeiros) {
      this.usuarioServico.buscarPorId(barbeiro.id_usuario).subscribe({
        next: (usuario) => {
          this.nomesBarbeiros.update((mapa) => ({
            ...mapa,
            [barbeiro.id]: usuario.nome,
          }));
        },
        error: () => {
          // Mantém o rótulo padrão "Barbeiro #id".
        },
      });
    }
  }
}
