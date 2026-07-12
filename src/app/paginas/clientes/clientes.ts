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

/** Quantidade de usuários por página. */
const TAMANHO_PAGINA = 10;

/**
 * Tela de clientes (administradores e donos). Lista os usuários com **busca e
 * paginação feitas no back-end** (para não sobrecarregar o front quando houver
 * muitos usuários) e permite **editar** cada um.
 *
 * Regras de edição (aplicadas também no back-end):
 *  - administrador edita qualquer usuário, inclusive o perfil;
 *  - dono edita apenas clientes e barbeiros (não edita admin nem dono) e não
 *    altera o perfil.
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

  /** Tamanho da página (exposto ao template). */
  protected readonly tamanhoPagina = TAMANHO_PAGINA;

  /** Usuários da página atual. */
  protected readonly usuarios = signal<Usuario[]>([]);

  /** Estado da paginação e da busca. */
  protected readonly pagina = signal(1);
  protected readonly total = signal(0);
  protected readonly termoBusca = signal('');

  /** Estado de carregamento e mensagens. */
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly mensagemSucesso = signal('');

  /** Edição: ID em edição (nulo quando nenhum) e campos do formulário. */
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

  /** Total de páginas, calculado a partir do total e do tamanho da página. */
  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / TAMANHO_PAGINA)),
  );

  /** Temporizador usado para "atrasar" a busca enquanto o usuário digita. */
  private temporizadorBusca: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.carregar();
  }

  /** Busca a página atual de usuários na API. */
  protected carregar(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.usuarioServico
      .listarPagina(this.pagina(), TAMANHO_PAGINA, this.termoBusca())
      .subscribe({
        next: (resultado) => {
          this.usuarios.set(resultado.itens);
          this.total.set(resultado.total);
          this.pagina.set(resultado.pagina);
          this.carregando.set(false);
        },
        error: (erro: HttpErrorResponse) => {
          this.carregando.set(false);
          this.mensagemErro.set(this.traduzirErro(erro));
        },
      });
  }

  /**
   * Chamado a cada tecla na busca: guarda o termo, volta para a primeira página
   * e recarrega com um pequeno atraso (evita uma requisição por tecla).
   */
  protected aoBuscar(valor: string): void {
    this.termoBusca.set(valor);
    this.pagina.set(1);

    if (this.temporizadorBusca) {
      clearTimeout(this.temporizadorBusca);
    }
    this.temporizadorBusca = setTimeout(() => this.carregar(), 350);
  }

  /** Vai para a página anterior, se houver. */
  protected paginaAnterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
      this.carregar();
    }
  }

  /** Vai para a próxima página, se houver. */
  protected proximaPagina(): void {
    if (this.pagina() < this.totalPaginas()) {
      this.pagina.update((p) => p + 1);
      this.carregar();
    }
  }

  /**
   * Indica se o usuário logado pode editar o usuário informado.
   * Admin edita todos; dono edita apenas clientes e barbeiros.
   */
  protected podeEditar(usuario: Usuario): boolean {
    if (this.ehAdmin()) {
      return true;
    }
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
        this.usuarios.update((lista) =>
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
