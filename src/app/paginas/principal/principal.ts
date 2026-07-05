import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import { AgendamentoServico } from '../../nucleo/servicos/agendamento.servico';
import { Agendamento, statusEncerrado } from '../../nucleo/modelos/agendamento.modelo';
import { formatarDataHora } from '../../nucleo/util/data-hora';

/** Um cartão de resumo exibido no painel. */
interface CartaoResumo {
  titulo: string;
  valor: string;
  detalhe: string;
}

/**
 * Página principal (painel) após o login. Mostra uma saudação e cartões de
 * resumo com dados reais: o cliente vê os próprios números; gestores (admin,
 * dono, barbeiro) veem também os números da barbearia.
 */
@Component({
  selector: 'app-principal',
  imports: [RouterLink],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal {
  private readonly sessao = inject(SessaoServico);
  private readonly agendamentoServico = inject(AgendamentoServico);

  /** Agendamentos do próprio usuário e (para gestores) de toda a barbearia. */
  private readonly meusAgendamentos = signal<Agendamento[]>([]);
  private readonly todosAgendamentos = signal<Agendamento[]>([]);

  /** Primeiro nome do usuário, usado na saudação. */
  protected readonly primeiroNome = computed(() => {
    const usuario = this.sessao.usuario();
    return usuario ? usuario.nome.split(' ')[0] : '';
  });

  /** Indica se o usuário é um gestor (admin, dono ou barbeiro). */
  protected readonly ehGestor = computed(() => {
    const perfil = this.sessao.usuario()?.perfil;
    return perfil === 'admin' || perfil === 'dono' || perfil === 'barbeiro';
  });

  /** Próximo agendamento futuro do usuário (ainda em aberto), se houver. */
  private readonly proximoAgendamento = computed(() => {
    const agora = Date.now();
    return this.meusAgendamentos()
      .filter(
        (a) =>
          !statusEncerrado(a.status) && new Date(a.inicio_em).getTime() >= agora,
      )
      .sort(
        (a, b) =>
          new Date(a.inicio_em).getTime() - new Date(b.inicio_em).getTime(),
      )[0];
  });

  /** Cartões de resumo, montados a partir dos dados reais. */
  protected readonly cartoes = computed<CartaoResumo[]>(() => {
    const proximo = this.proximoAgendamento();

    const cartoes: CartaoResumo[] = [
      {
        titulo: 'Meus agendamentos',
        valor: String(this.meusAgendamentos().length),
        detalhe: 'no total',
      },
      {
        titulo: 'Próximo horário',
        valor: proximo ? this.formatarHora(proximo.inicio_em) : '—',
        detalhe: proximo ? this.formatarData(proximo.inicio_em) : 'sem agendamentos',
      },
    ];

    if (this.ehGestor()) {
      cartoes.push(
        {
          titulo: 'Agendamentos hoje',
          valor: String(this.contarHoje()),
          detalhe: 'na barbearia',
        },
        {
          titulo: 'Total da barbearia',
          valor: String(this.todosAgendamentos().length),
          detalhe: 'agendamentos registrados',
        },
      );
    }

    return cartoes;
  });

  constructor() {
    this.carregar();
  }

  /** Carrega os agendamentos do usuário e, se for gestor, os da barbearia. */
  private carregar(): void {
    this.agendamentoServico.listarMeus().subscribe({
      next: (lista) => this.meusAgendamentos.set(lista),
      error: () => this.meusAgendamentos.set([]),
    });

    if (this.ehGestor()) {
      this.agendamentoServico.listarTodos().subscribe({
        next: (lista) => this.todosAgendamentos.set(lista),
        error: () => this.todosAgendamentos.set([]),
      });
    }
  }

  /** Conta quantos agendamentos da barbearia começam hoje. */
  private contarHoje(): number {
    const hoje = new Date().toDateString();
    return this.todosAgendamentos().filter(
      (a) => new Date(a.inicio_em).toDateString() === hoje,
    ).length;
  }

  /** Devolve só a parte de hora (HH:MM) de uma data ISO. */
  private formatarHora(dataIso: string): string {
    return new Date(dataIso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /** Devolve só a parte de data (dd/mm/aaaa) de uma data ISO. */
  private formatarData(dataIso: string): string {
    return new Date(dataIso).toLocaleDateString('pt-BR');
  }

  /** Exposto ao template para exibir o próximo horário por extenso, se quiser. */
  protected formatarCompleto(dataIso: string): string {
    return formatarDataHora(dataIso);
  }
}
