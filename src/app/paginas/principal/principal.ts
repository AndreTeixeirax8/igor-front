import { Component, inject, computed } from '@angular/core';

import { SessaoServico } from '../../nucleo/servicos/sessao.servico';

/**
 * Página principal (painel) exibida após o login, dentro do layout interno.
 * Mostra uma saudação e cartões de resumo. As funcionalidades de negócio ainda
 * serão implementadas; aqui temos a estrutura visual do protótipo.
 */
@Component({
  selector: 'app-principal',
  imports: [],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal {
  private readonly sessao = inject(SessaoServico);

  /** Primeiro nome do usuário autenticado, usado na saudação. */
  protected readonly primeiroNome = computed(() => {
    const usuario = this.sessao.usuario();
    return usuario ? usuario.nome.split(' ')[0] : '';
  });

  /**
   * Cartões de resumo exibidos no topo do painel. Os valores são fictícios,
   * apenas para a apresentação do protótipo.
   */
  protected readonly cartoesResumo = [
    { titulo: 'Agendamentos hoje', valor: '08', detalhe: '+2 desde ontem' },
    { titulo: 'Clientes ativos', valor: '124', detalhe: 'na sua base' },
    { titulo: 'Serviços oferecidos', valor: '06', detalhe: 'no catálogo' },
    { titulo: 'Faturamento do mês', valor: 'R$ 4.250', detalhe: 'estimado' },
  ];
}
