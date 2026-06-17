import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { Logotipo } from '../../compartilhado/logotipo/logotipo';
import { rotuloDoPerfil } from '../../nucleo/modelos/usuario.modelo';

/**
 * Item de menu exibido na barra lateral. Por enquanto, apenas o "Painel" está
 * realmente ativo; os demais são espaços reservados para as próximas telas.
 */
interface ItemMenu {
  rotulo: string;
  icone: string;
  ativo: boolean;
}

/**
 * Tela principal (painel) exibida após o login. Mostra os dados do usuário
 * autenticado, um menu lateral e cartões de resumo. As funcionalidades de
 * negócio (agendamentos, serviços etc.) ainda serão implementadas; aqui temos a
 * estrutura visual do protótipo.
 */
@Component({
  selector: 'app-principal',
  imports: [Logotipo],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal {
  private readonly sessao = inject(SessaoServico);
  private readonly autenticacaoServico = inject(AutenticacaoServico);
  private readonly roteador = inject(Router);

  /** Usuário autenticado atual (vem da sessão). */
  protected readonly usuario = this.sessao.usuario;

  /** Primeiro nome do usuário, usado na saudação. */
  protected readonly primeiroNome = computed(() => {
    const usuario = this.usuario();
    return usuario ? usuario.nome.split(' ')[0] : '';
  });

  /** Rótulo amigável do perfil do usuário (ex.: "Administrador"). */
  protected readonly rotuloPerfil = computed(() => {
    const usuario = this.usuario();
    return usuario ? rotuloDoPerfil(usuario.perfil) : '';
  });

  /** Iniciais do usuário, exibidas no avatar quando não há foto. */
  protected readonly iniciais = computed(() => this.calcularIniciais());

  /** Itens do menu lateral. */
  protected readonly itensMenu: ItemMenu[] = [
    { rotulo: 'Painel', icone: '▣', ativo: true },
    { rotulo: 'Agendamentos', icone: '🗓', ativo: false },
    { rotulo: 'Clientes', icone: '👥', ativo: false },
    { rotulo: 'Serviços', icone: '✂', ativo: false },
    { rotulo: 'Configurações', icone: '⚙', ativo: false },
  ];

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

  /**
   * Encerra a sessão do usuário e o redireciona para a tela de login.
   */
  protected sair(): void {
    this.autenticacaoServico.sair();
    this.roteador.navigate(['/login']);
  }

  /**
   * Calcula as iniciais (até duas letras) a partir do nome do usuário.
   */
  private calcularIniciais(): string {
    const usuario = this.usuario();
    if (!usuario) {
      return '';
    }

    const partesNome = usuario.nome.trim().split(/\s+/);
    const primeiraLetra = partesNome[0]?.charAt(0) ?? '';
    const ultimaLetra =
      partesNome.length > 1 ? partesNome[partesNome.length - 1].charAt(0) : '';

    return (primeiraLetra + ultimaLetra).toUpperCase();
  }
}
