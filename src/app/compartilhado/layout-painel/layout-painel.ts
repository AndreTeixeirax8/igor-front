import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { Logotipo } from '../logotipo/logotipo';
import { rotuloDoPerfil, PerfilUsuario } from '../../nucleo/modelos/usuario.modelo';

/**
 * Item do menu lateral.
 *  - rota: para onde o item navega (quando disponível).
 *  - disponivel: false indica uma tela ainda não implementada ("Em breve").
 *  - perfisPermitidos: se informado, o item só aparece para esses perfis;
 *    se ausente, aparece para qualquer usuário autenticado.
 */
interface ItemMenu {
  rotulo: string;
  icone: string;
  rota?: string;
  disponivel: boolean;
  perfisPermitidos?: PerfilUsuario[];
}

/**
 * Layout das áreas internas (após o login). Desenha a barra lateral de
 * navegação e o topo com os dados do usuário, e exibe a página atual no
 * <router-outlet>. É reaproveitado por todas as telas internas (painel,
 * clientes etc.), evitando repetir a estrutura em cada uma.
 */
@Component({
  selector: 'app-layout-painel',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logotipo],
  templateUrl: './layout-painel.html',
  styleUrl: './layout-painel.scss',
})
export class LayoutPainel {
  private readonly sessao = inject(SessaoServico);
  private readonly autenticacaoServico = inject(AutenticacaoServico);
  private readonly roteador = inject(Router);

  /** Usuário autenticado atual (vem da sessão). */
  protected readonly usuario = this.sessao.usuario;

  /** Rótulo amigável do perfil do usuário (ex.: "Administrador"). */
  protected readonly rotuloPerfil = computed(() => {
    const usuario = this.usuario();
    return usuario ? rotuloDoPerfil(usuario.perfil) : '';
  });

  /** Iniciais do usuário, exibidas no avatar. */
  protected readonly iniciais = computed(() => this.calcularIniciais());

  /** Todos os itens do menu. */
  private readonly itensMenu: ItemMenu[] = [
    { rotulo: 'Painel', icone: '▣', rota: '/principal', disponivel: true },
    { rotulo: 'Agendar', icone: '🗓', rota: '/agendar', disponivel: true },
    {
      rotulo: 'Meus agendamentos',
      icone: '📋',
      rota: '/meus-agendamentos',
      disponivel: true,
    },
    {
      rotulo: 'Agenda',
      icone: '📆',
      rota: '/agenda',
      disponivel: true,
      perfisPermitidos: ['admin', 'dono', 'barbeiro'],
    },
    {
      rotulo: 'Gestão',
      icone: '✂',
      rota: '/gestao',
      disponivel: true,
      perfisPermitidos: ['admin', 'dono'],
    },
    {
      rotulo: 'Clientes',
      icone: '👥',
      rota: '/clientes',
      disponivel: true,
      perfisPermitidos: ['admin'],
    },
  ];

  /**
   * Itens do menu que o usuário atual pode ver: os itens com perfis restritos
   * só aparecem para os perfis permitidos.
   */
  protected readonly itensMenuVisiveis = computed(() => {
    const perfil = this.usuario()?.perfil;
    return this.itensMenu.filter(
      (item) =>
        !item.perfisPermitidos ||
        (perfil !== undefined && item.perfisPermitidos.includes(perfil)),
    );
  });

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
