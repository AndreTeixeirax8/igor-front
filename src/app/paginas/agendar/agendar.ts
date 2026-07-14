import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { BarbeariaServico } from '../../nucleo/servicos/barbearia.servico';
import { BarbeiroServico } from '../../nucleo/servicos/barbeiro.servico';
import { ServicoServico } from '../../nucleo/servicos/servico.servico';
import { AgendamentoServico } from '../../nucleo/servicos/agendamento.servico';
import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';

import { Barbearia } from '../../nucleo/modelos/barbearia.modelo';
import { Barbeiro } from '../../nucleo/modelos/barbeiro.modelo';
import { Servico } from '../../nucleo/modelos/servico.modelo';
import { paraRFC3339ComFusoLocal } from '../../nucleo/util/data-hora';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';
import { Mensagem } from '../../compartilhado/mensagem/mensagem';

/** Uma célula do calendário (dia do mês). */
interface CelulaCalendario {
  data: string; // "AAAA-MM-DD"
  dia: number;
  disponivel: boolean;
  hoje: boolean;
}

/** Nomes curtos dos dias da semana, para o cabeçalho do calendário. */
const CABECALHO_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Nomes dos meses, para o rótulo do calendário. */
const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/**
 * Tela de agendamento do cliente. Conduz a escolha em etapas
 * (barbearia → barbeiro → serviço) e, no fim, mostra um calendário do mês com os
 * horários realmente livres do barbeiro. O cliente clica num horário e confirma;
 * como a disponibilidade vem do back-end, um horário já ocupado nunca aparece.
 */
@Component({
  selector: 'app-agendar',
  imports: [FormsModule, Mensagem],
  templateUrl: './agendar.html',
  styleUrl: './agendar.scss',
})
export class Agendar {
  private readonly barbeariaServico = inject(BarbeariaServico);
  private readonly barbeiroServico = inject(BarbeiroServico);
  private readonly servicoServico = inject(ServicoServico);
  private readonly agendamentoServico = inject(AgendamentoServico);
  private readonly usuarioServico = inject(UsuarioServico);
  private readonly roteador = inject(Router);

  /** Cabeçalho do calendário (dias da semana). */
  protected readonly cabecalhoSemana = CABECALHO_SEMANA;

  /** Listas carregadas da API. */
  protected readonly barbearias = signal<Barbearia[]>([]);
  protected readonly barbeiros = signal<Barbeiro[]>([]);
  protected readonly servicos = signal<Servico[]>([]);

  /** Mapa id do barbeiro → nome do usuário, para exibição. */
  protected readonly nomesBarbeiros = signal<Record<number, string | undefined>>({});

  /** Seleções. */
  protected readonly barbeariaSelecionadaId = signal<number | null>(null);
  protected readonly barbeiroSelecionadoId = signal<number | null>(null);
  protected readonly servicoSelecionadoId = signal<number | null>(null);

  /** Calendário e horários. */
  protected readonly mesReferencia = signal<Date>(this.primeiroDiaDoMes(new Date()));
  private readonly horariosPorData = signal<Record<string, string[]>>({});
  protected readonly diaSelecionado = signal<string | null>(null);
  protected readonly horaSelecionada = signal<string | null>(null);
  protected readonly carregandoHorarios = signal(false);

  /** Observações e estado de envio. */
  protected observacoes = signal('');
  protected readonly enviando = signal(false);
  protected readonly mensagemErro = signal('');

  /** Serviço selecionado (objeto completo), para o resumo. */
  protected readonly servicoSelecionado = computed(() =>
    this.servicos().find((servico) => servico.id === this.servicoSelecionadoId()),
  );

  /** Rótulo do mês exibido (ex.: "Julho de 2026"). */
  protected readonly rotuloMes = computed(() => {
    const referencia = this.mesReferencia();
    return `${NOMES_MESES[referencia.getMonth()]} de ${referencia.getFullYear()}`;
  });

  /** Células do calendário do mês em exibição (com espaços de alinhamento). */
  protected readonly celulas = computed<(CelulaCalendario | null)[]>(() => {
    const referencia = this.mesReferencia();
    const ano = referencia.getFullYear();
    const mes = referencia.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const deslocamentoInicial = new Date(ano, mes, 1).getDay();
    const hoje = this.dataParaTexto(new Date());

    const celulas: (CelulaCalendario | null)[] = [];
    for (let i = 0; i < deslocamentoInicial; i++) {
      celulas.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = this.dataParaTexto(new Date(ano, mes, dia));
      const disponivel = (this.horariosPorData()[data]?.length ?? 0) > 0;
      celulas.push({ data, dia, disponivel, hoje: data === hoje });
    }
    return celulas;
  });

  /** Horários livres do dia selecionado. */
  protected readonly horariosDoDia = computed(() => {
    const dia = this.diaSelecionado();
    return dia ? (this.horariosPorData()[dia] ?? []) : [];
  });

  /** Indica se já é possível concluir o agendamento. */
  protected readonly podeAgendar = computed(
    () => this.diaSelecionado() !== null && this.horaSelecionada() !== null,
  );

  constructor() {
    this.carregarBarbearias();
  }

  // ===== Etapas de escolha ==================================================

  private carregarBarbearias(): void {
    this.barbeariaServico.listar().subscribe({
      next: (lista) => this.barbearias.set(lista),
      error: () =>
        this.mensagemErro.set('Não foi possível carregar as barbearias.'),
    });
  }

  protected selecionarBarbearia(idBarbearia: number): void {
    this.barbeariaSelecionadaId.set(idBarbearia);
    this.barbeiroSelecionadoId.set(null);
    this.servicoSelecionadoId.set(null);
    this.limparCalendario();

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

  protected selecionarBarbeiro(idBarbeiro: number): void {
    this.barbeiroSelecionadoId.set(idBarbeiro);
    this.servicoSelecionadoId.set(null);
    this.limparCalendario();
  }

  protected selecionarServico(idServico: number): void {
    this.servicoSelecionadoId.set(idServico);
    this.limparCalendario();
    this.carregarHorarios();
  }

  // ===== Calendário =========================================================

  protected mesAnterior(): void {
    const referencia = this.mesReferencia();
    this.mesReferencia.set(new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1));
    this.diaSelecionado.set(null);
    this.horaSelecionada.set(null);
    this.carregarHorarios();
  }

  protected proximoMes(): void {
    const referencia = this.mesReferencia();
    this.mesReferencia.set(new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1));
    this.diaSelecionado.set(null);
    this.horaSelecionada.set(null);
    this.carregarHorarios();
  }

  protected selecionarDia(celula: CelulaCalendario): void {
    if (!celula.disponivel) {
      return;
    }
    this.diaSelecionado.set(celula.data);
    this.horaSelecionada.set(null);
  }

  protected selecionarHora(hora: string): void {
    this.horaSelecionada.set(hora);
  }

  /** Busca no back-end os horários livres do barbeiro para o mês em exibição. */
  private carregarHorarios(): void {
    const idBarbeiro = this.barbeiroSelecionadoId();
    const idServico = this.servicoSelecionadoId();
    if (idBarbeiro === null || idServico === null) {
      return;
    }

    // O período vai do maior entre "hoje" e o 1º dia do mês até o fim do mês.
    const referencia = this.mesReferencia();
    const primeiro = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
    const ultimo = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = primeiro < hoje ? hoje : primeiro;

    this.carregandoHorarios.set(true);
    this.agendamentoServico
      .horariosDisponiveis(
        idBarbeiro,
        idServico,
        this.dataParaTexto(inicio),
        this.dataParaTexto(ultimo),
      )
      .subscribe({
        next: (dias) => {
          const mapa: Record<string, string[]> = {};
          for (const dia of dias) {
            mapa[dia.data] = dia.horarios;
          }
          this.horariosPorData.set(mapa);
          this.carregandoHorarios.set(false);
        },
        error: () => {
          this.horariosPorData.set({});
          this.carregandoHorarios.set(false);
        },
      });
  }

  // ===== Confirmação ========================================================

  protected agendar(): void {
    const dia = this.diaSelecionado();
    const hora = this.horaSelecionada();
    if (dia === null || hora === null) {
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');

    const observacoesInformadas = this.observacoes().trim();

    this.agendamentoServico
      .criar({
        id_barbeiro: this.barbeiroSelecionadoId()!,
        id_servico: this.servicoSelecionadoId()!,
        inicio_em: paraRFC3339ComFusoLocal(`${dia}T${hora}`),
        observacoes: observacoesInformadas === '' ? null : observacoesInformadas,
      })
      .subscribe({
        next: () => this.roteador.navigate(['/meus-agendamentos']),
        error: (erro: HttpErrorResponse) => {
          this.enviando.set(false);
          if (erro.status === 409) {
            // Alguém agendou esse horário primeiro: avisa e recarrega a lista,
            // para o horário ocupado sumir das opções.
            this.mensagemErro.set(
              'Esse horário acabou de ser reservado por outra pessoa. Escolha outro, por favor.',
            );
            this.horaSelecionada.set(null);
            this.carregarHorarios();
            return;
          }
          this.mensagemErro.set(
            mensagemDeErro(erro, 'Não foi possível concluir o agendamento.'),
          );
        },
      });
  }

  // ===== Auxiliares =========================================================

  protected nomeBarbeiro(barbeiro: Barbeiro): string {
    return this.nomesBarbeiros()[barbeiro.id] ?? `Barbeiro #${barbeiro.id}`;
  }

  /** Zera o calendário e a seleção de dia/hora. */
  private limparCalendario(): void {
    this.horariosPorData.set({});
    this.diaSelecionado.set(null);
    this.horaSelecionada.set(null);
    this.mesReferencia.set(this.primeiroDiaDoMes(new Date()));
  }

  /** Primeiro dia do mês de uma data. */
  private primeiroDiaDoMes(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), 1);
  }

  /** Converte uma data em texto "AAAA-MM-DD" no horário local. */
  private dataParaTexto(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /** Busca o nome do usuário de cada barbeiro para exibir na lista. */
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
