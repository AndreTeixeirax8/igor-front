import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';
import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import {
  Usuario,
  PerfilUsuario,
  rotuloDoPerfil,
} from '../../nucleo/modelos/usuario.modelo';

/**
 * Tela de clientes (administradores e donos). Lista os usuários em uma tabela
 * com busca e permite **editar** cada um.
 *
 * Regras de edição (aplicadas também no back-end):
 *  - administrador pode editar qualquer usuário, inclusive o perfil;
 *  - dono pode editar apenas clientes e barbeiros (não edita admin nem dono) e
 *    não pode alterar o perfil.
 */
@Component({
  selector: 'app-clientes',
  imports: [FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes {
  private readonly usuarioServico = inject(UsuarioServico);
  private readonly sessao = inject(SessaoServico);

  /** Lista completa de usuários trazida da API. */
  private readonly listaCompleta = signal<Usuario[]>([]);

  /** Texto digitado no campo de busca. */
  protected readonly termoBusca = signal('');

  /** Indica que a lista está sendo carregada da API. */
  protected readonly carregando = signal(true);

  /** Mensagens de feedback. */
  protected readonly mensagemErro = signal('');
  protected readonly mensagemSucesso = signal('');

  /** Edição: ID do usuário em edição (nulo quando nenhum) e campos do formulário. */
  protected readonly usuarioEmEdicaoId = signal<number | null>(null);
  protected editNome = signal('');
  protected editTelefone = signal('');
  protected editPerfil = signal<PerfilUsuario>('cliente');

  /** Perfis disponíveis no seletor (só o admin altera perfil). */
  protected readonly perfisDisponiveis: PerfilUsuario[] = [
    'cliente',
    'barbeiro',
    'dono',
    'admin',
  ];

  /** Indica se o usuário logado é administrador. */
  protected readonly ehAdmin = computed(
    () => this.sessao.usuario()?.perfil === 'admin',
  );

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

  /** Indica se nenhum usuário foi carregado (usado para erro de carregamento). */
  protected readonly listaCompletaVazia = computed(
    () => this.listaCompleta().length === 0,
  );

  constructor() {
    this.carregar();
  }

  /** Busca a lista de usuários na API e trata os possíveis erros. */
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
   * Indica se o usuário logado pode editar o usuário informado.
   * Admin edita todos; dono edita apenas clientes e barbeiros.
   */
  protected podeEditar(usuario: Usuario): boolean {
    if (this.ehAdmin()) {
      return true;
    }
    // Dono (a tela só abre para admin/dono): não edita admin nem dono.
    return usuario.perfil === 'cliente' || usuario.perfil === 'barbeiro';
  }

  /** Entra no modo de edição de um usuário, preenchendo o formulário. */
  protected iniciarEdicao(usuario: Usuario): void {
    this.usuarioEmEdicaoId.set(usuario.id);
    this.editNome.set(usuario.nome);
    this.editTelefone.set(usuario.telefone ?? '');
    this.editPerfil.set(usuario.perfil);
    this.limparMensagens();
  }

  /** Cancela a edição em andamento. */
  protected cancelarEdicao(): void {
    this.usuarioEmEdicaoId.set(null);
  }

  /** Salva as alterações do usuário em edição. */
  protected salvarEdicao(id: number): void {
    if (!this.editNome().trim()) {
      this.mensagemErro.set('O nome não pode ficar vazio.');
      return;
    }
    this.limparMensagens();

    const telefone = this.editTelefone().trim();
    const dados = this.ehAdmin()
      ? {
          nome: this.editNome().trim(),
          telefone: telefone === '' ? null : telefone,
          perfil: this.editPerfil(),
        }
      : {
          nome: this.editNome().trim(),
          telefone: telefone === '' ? null : telefone,
        };

    this.usuarioServico.atualizar(id, dados).subscribe({
      next: (atualizado) => {
        this.mensagemSucesso.set('Usuário atualizado com sucesso.');
        this.usuarioEmEdicaoId.set(null);
        this.listaCompleta.update((lista) =>
          lista.map((u) => (u.id === atualizado.id ? atualizado : u)),
        );
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagemErro.set(
          erro.error?.erro ?? 'Não foi possível salvar as alterações.',
        );
      },
    });
  }

  /** Devolve o rótulo amigável de um perfil (ex.: "Cliente", "Administrador"). */
  protected rotuloPerfil(perfil: PerfilUsuario): string {
    return rotuloDoPerfil(perfil);
  }

  /** Calcula as iniciais (até duas letras) do nome, exibidas no avatar. */
  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.charAt(0) ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (primeira + ultima).toUpperCase();
  }

  private limparMensagens(): void {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
  }

  /** Converte o erro HTTP em uma mensagem clara para o usuário. */
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
