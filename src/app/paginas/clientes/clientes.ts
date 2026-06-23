import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';
import {
  Usuario,
  PerfilUsuario,
  rotuloDoPerfil,
} from '../../nucleo/modelos/usuario.modelo';

/**
 * Tela de clientes (somente administradores). Lista os usuários cadastrados em
 * uma tabela com nome, contato e perfil, além de um campo de busca para filtrar
 * rapidamente pelos dados principais.
 */
@Component({
  selector: 'app-clientes',
  imports: [FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes {
  private readonly usuarioServico = inject(UsuarioServico);

  /** Lista completa de usuários trazida da API. */
  private readonly listaCompleta = signal<Usuario[]>([]);

  /** Texto digitado no campo de busca. */
  protected readonly termoBusca = signal('');

  /** Indica que a lista está sendo carregada da API. */
  protected readonly carregando = signal(true);

  /** Mensagem de erro ao carregar; vazia quando não há erro. */
  protected readonly mensagemErro = signal('');

  /**
   * Lista exibida na tabela: a lista completa filtrada pelo termo de busca
   * (nome, e-mail ou telefone). A busca ignora maiúsculas/minúsculas.
   */
  protected readonly clientesFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    if (termo === '') {
      return this.listaCompleta();
    }

    return this.listaCompleta().filter((usuario) => {
      const telefone = usuario.telefone ?? '';
      return (
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        telefone.toLowerCase().includes(termo)
      );
    });
  });

  /** Quantidade de usuários atualmente exibidos. */
  protected readonly totalExibido = computed(
    () => this.clientesFiltrados().length,
  );

  constructor() {
    // Ao abrir a tela, já carrega a lista de usuários.
    this.carregar();
  }

  /**
   * Busca a lista de usuários na API e trata os possíveis erros.
   */
  protected carregar(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.usuarioServico.listarTodos().subscribe({
      next: (usuarios) => {
        this.listaCompleta.set(usuarios);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando.set(false);
        this.mensagemErro.set(this.traduzirErro(erro));
      },
    });
  }

  /**
   * Devolve o rótulo amigável de um perfil (ex.: "Cliente", "Administrador").
   */
  protected rotuloPerfil(perfil: PerfilUsuario): string {
    return rotuloDoPerfil(perfil);
  }

  /**
   * Calcula as iniciais (até duas letras) do nome, exibidas no avatar.
   */
  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.charAt(0) ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (primeira + ultima).toUpperCase();
  }

  /**
   * Converte o erro HTTP em uma mensagem clara para o usuário.
   */
  private traduzirErro(erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return 'Não foi possível falar com o servidor. Verifique se o back-end está no ar.';
    }
    if (erro.status === 403) {
      return 'Você não tem permissão para ver esta lista.';
    }
    return 'Não foi possível carregar os clientes. Tente novamente.';
  }
}
