import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { Logotipo } from '../logotipo/logotipo';
import { rotuloDoPerfil } from '../../nucleo/modelos/usuario.modelo';

/**
 * Item do menu lateral.
 *  - rota: para onde o item navega (quando disponível).
 *  - disponivel: false indica uma tela ainda não implementada ("Em breve").
 *  - somenteAdmin: true faz o item aparecer apenas para administradores.
 */
interface ItemMenu {
  rotulo: string;
  icone: string;
  rota?: string;
  disponivel: boolean;
  somenteAdmin?: boolean;
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

  /** Indica se o usuário atual é administrador. */
  private readonly ehAdmin = computed(() => this.usuario()?.perfil === 'admin');

  /** Rótulo amigável do perfil do usuário (ex.: "Administrador"). */
  protected readonly rotuloPerfil = computed(() => {
    const usuario = this.usuario();
    return usuario ? rotuloDoPerfil(usuario.perfil) : '';
  });

  /** Iniciais do usuário, exibidas no avatar. */
  protected readonly iniciais = computed(() => this.calcularIniciais());

  /** Todos os itens do menu (alguns ainda marcados como "Em breve"). */
  private readonly itensMenu: ItemMenu[] = [
    { rotulo: 'Painel', icone: '▣', rota: '/principal', disponivel: true },
    { rotulo: 'Agendamentos', icone: '🗓', disponivel: false },
    {
      rotulo: 'Clientes',
      icone: '👥',
      rota: '/clientes',
      disponivel: true,
      somenteAdmin: true,
    },
    { rotulo: 'Serviços', icone: '✂', disponivel: false },
    { rotulo: 'Configurações', icone: '⚙', disponivel: false },
  ];

  /**
   * Itens do menu que o usuário atual pode ver: os itens restritos a
   * administradores são ocultados para os demais perfis.
   */
  protected readonly itensMenuVisiveis = computed(() =>
    this.itensMenu.filter((item) => !item.somenteAdmin || this.ehAdmin()),
  );

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
