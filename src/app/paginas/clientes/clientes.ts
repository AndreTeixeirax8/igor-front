import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';
import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import {
  Usuario,
  PerfilUsuario,
  rotuloDoPerfil,
} from '../../nucleo/modelos/usuario.modelo';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';
import { Avatar } from '../../compartilhado/avatar/avatar';
import { Selo } from '../../compartilhado/selo/selo';
import { Mensagem } from '../../compartilhado/mensagem/mensagem';
import { SeletorFoto } from '../../compartilhado/seletor-foto/seletor-foto';

/** Quantidade de usuários por página. */
const TAMANHO_PAGINA = 10;

/**
 * Tela de clientes (administradores e donos). Lista os usuários com **busca e
 * paginação feitas no back-end** (para não sobrecarregar o front quando houver
 * muitos usuários) e permite **editar** cada um.
 *
 * Regras de edição (aplicadas também no back-end):
 *  - administrador edita qualquer usuário, inclusive o perfil;
 *  - dono edita qualquer usuário (inclusive o próprio perfil e outros donos),
 *    menos administradores, e não altera o campo perfil.
 */
@Component({
  selector: 'app-clientes',
  imports: [FormsModule, Avatar, Selo, Mensagem, SeletorFoto],
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

  /** Nova foto de perfil escolhida na edição (nula quando não trocada). */
  protected readonly editFoto = signal<File | null>(null);

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
        error: (erro: unknown) => {
          this.carregando.set(false);
          this.mensagemErro.set(
            mensagemDeErro(erro, 'Não foi possível carregar os clientes. Tente novamente.'),
          );
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
   * Admin edita todos; dono edita qualquer usuário (inclusive o próprio perfil
   * e outros donos), menos administradores.
   */
  protected podeEditar(usuario: Usuario): boolean {
    if (this.ehAdmin()) {
      return true;
    }
    return usuario.perfil !== 'admin';
  }

  /** Entra no modo de edição de um usuário, preenchendo o formulário. */
  protected iniciarEdicao(usuario: Usuario): void {
    this.usuarioEmEdicaoId.set(usuario.id);
    this.editNome.set(usuario.nome);
    this.editTelefone.set(usuario.telefone ?? '');
    this.editPerfil.set(usuario.perfil);
    this.editFoto.set(null);
    this.limparMensagens();
  }

  /** Cancela a edição em andamento. */
  protected cancelarEdicao(): void {
    this.usuarioEmEdicaoId.set(null);
    this.editFoto.set(null);
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
        const novaFoto = this.editFoto();

        // Sem foto nova: encerra a edição com os dados já atualizados.
        if (!novaFoto) {
          this.concluirEdicao(atualizado);
          return;
        }

        // Com foto nova: envia o arquivo e usa a resposta (que já vem com o
        // novo url_avatar) para atualizar a linha da tabela.
        this.usuarioServico.enviarFoto(id, novaFoto).subscribe({
          next: (comFoto) => this.concluirEdicao(comFoto),
          error: (erro: unknown) => {
            // Os demais campos foram salvos; avisamos que só a foto falhou.
            this.concluirEdicao(atualizado);
            this.mensagemSucesso.set('');
            this.mensagemErro.set(
              mensagemDeErro(erro, 'Dados salvos, mas não foi possível enviar a foto.'),
            );
          },
        });
      },
      error: (erro: unknown) => {
        this.mensagemErro.set(
          mensagemDeErro(erro, 'Não foi possível salvar as alterações.'),
        );
      },
    });
  }

  /** Fecha o modo de edição e reflete o usuário atualizado na tabela. */
  private concluirEdicao(atualizado: Usuario): void {
    this.mensagemSucesso.set('Usuário atualizado com sucesso.');
    this.usuarioEmEdicaoId.set(null);
    this.editFoto.set(null);
    this.usuarios.update((lista) =>
      lista.map((u) => (u.id === atualizado.id ? atualizado : u)),
    );
  }

  /** Devolve o rótulo amigável de um perfil (ex.: "Cliente", "Administrador"). */
  protected rotuloPerfil(perfil: PerfilUsuario): string {
    return rotuloDoPerfil(perfil);
  }

  private limparMensagens(): void {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
  }
}
