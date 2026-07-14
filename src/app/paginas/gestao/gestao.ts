import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Mensagem } from '../../compartilhado/mensagem/mensagem';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';
import { BarbeariaServico } from '../../nucleo/servicos/barbearia.servico';
import { BarbeiroServico } from '../../nucleo/servicos/barbeiro.servico';
import { ServicoServico } from '../../nucleo/servicos/servico.servico';
import { DisponibilidadeServico } from '../../nucleo/servicos/disponibilidade.servico';
import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';

import { Barbearia } from '../../nucleo/modelos/barbearia.modelo';
import { Barbeiro } from '../../nucleo/modelos/barbeiro.modelo';
import { Servico } from '../../nucleo/modelos/servico.modelo';
import { Usuario } from '../../nucleo/modelos/usuario.modelo';
import {
  Disponibilidade,
  NOMES_DIAS_SEMANA,
  nomeDiaSemana,
} from '../../nucleo/modelos/disponibilidade.modelo';

/**
 * Tela de gestão (administradores e donos). Permite cadastrar uma barbearia e,
 * dentro dela, seus serviços, barbeiros e a grade de horários de cada barbeiro
 * — exatamente o que o cliente precisa para conseguir agendar.
 */
@Component({
  selector: 'app-gestao',
  imports: [FormsModule, Mensagem],
  templateUrl: './gestao.html',
  styleUrl: './gestao.scss',
})
export class Gestao {
  private readonly barbeariaServico = inject(BarbeariaServico);
  private readonly barbeiroServico = inject(BarbeiroServico);
  private readonly servicoServico = inject(ServicoServico);
  private readonly disponibilidadeServico = inject(DisponibilidadeServico);
  private readonly usuarioServico = inject(UsuarioServico);

  /** Dias da semana para o seletor de disponibilidade. */
  protected readonly diasSemana = NOMES_DIAS_SEMANA.map((nome, valor) => ({
    valor,
    nome,
  }));

  /** Listas. */
  protected readonly barbearias = signal<Barbearia[]>([]);
  protected readonly servicos = signal<Servico[]>([]);
  protected readonly barbeiros = signal<Barbeiro[]>([]);
  protected readonly disponibilidades = signal<Disponibilidade[]>([]);

  /** Seleções. */
  protected readonly barbeariaSelecionadaId = signal<number | null>(null);
  protected readonly barbeiroSelecionadoId = signal<number | null>(null);

  /** Mensagens de feedback. */
  protected readonly mensagemErro = signal('');
  protected readonly mensagemSucesso = signal('');

  /** Formulário: nova barbearia. */
  protected barbeariaNome = signal('');
  protected barbeariaCidade = signal('');
  protected barbeariaEstado = signal('');
  protected barbeariaTelefone = signal('');

  /** Formulário: novo serviço. */
  protected servicoNome = signal('');
  protected servicoDuracao = signal<number | null>(null);
  protected servicoPreco = signal<number | null>(null);

  /** Edição de serviço: ID em edição (nulo quando nenhum) e campos do formulário. */
  protected readonly servicoEmEdicaoId = signal<number | null>(null);
  protected editServicoNome = signal('');
  protected editServicoDuracao = signal<number | null>(null);
  protected editServicoPreco = signal<number | null>(null);

  /** Formulário: novo barbeiro. */
  protected barbeiroIdUsuario = signal<number | null>(null);
  protected barbeiroBio = signal('');

  /** Todos os usuários (para o seletor ao vincular um barbeiro). */
  protected readonly usuarios = signal<Usuario[]>([]);
  /** Texto de busca no seletor de usuário. */
  protected buscaUsuario = signal('');

  /** Usuário atualmente selecionado no formulário de barbeiro (ou undefined). */
  protected readonly usuarioBarbeiroSelecionado = computed(() =>
    this.usuarios().find((u) => u.id === this.barbeiroIdUsuario()),
  );

  /**
   * Usuários que podem ser vinculados como barbeiro: exclui quem já é barbeiro
   * desta barbearia e aplica a busca por nome/e-mail. Limita a 8 resultados.
   */
  protected readonly usuariosDisponiveis = computed(() => {
    const termo = this.buscaUsuario().trim().toLowerCase();
    const jaBarbeiros = new Set(this.barbeiros().map((b) => b.id_usuario));

    return this.usuarios()
      .filter((u) => !jaBarbeiros.has(u.id))
      .filter(
        (u) =>
          termo === '' ||
          u.nome.toLowerCase().includes(termo) ||
          u.email.toLowerCase().includes(termo),
      )
      .slice(0, 8);
  });

  /** Formulário: nova disponibilidade. */
  protected dispDia = signal(1);
  protected dispInicio = signal('09:00');
  protected dispFim = signal('18:00');

  /** Barbearia atualmente selecionada (objeto completo). */
  protected readonly barbeariaSelecionada = computed(() =>
    this.barbearias().find((b) => b.id === this.barbeariaSelecionadaId()),
  );

  /** Nome do barbeiro selecionado (para o título da grade de horários). */
  protected readonly nomeBarbeiroSelecionado = computed(() => {
    const barbeiro = this.barbeiros().find(
      (b) => b.id === this.barbeiroSelecionadoId(),
    );
    return barbeiro ? this.nomeUsuario(barbeiro.id_usuario) : '';
  });

  constructor() {
    this.carregarBarbearias();
    this.carregarUsuarios();
  }

  /** Carrega os usuários (usado no seletor ao vincular um barbeiro). */
  private carregarUsuarios(): void {
    this.usuarioServico.listarTodos().subscribe({
      next: (lista) => this.usuarios.set(lista),
      error: () => this.usuarios.set([]),
    });
  }

  // ===== Barbearias ========================================================

  private carregarBarbearias(): void {
    this.barbeariaServico.listar().subscribe({
      next: (lista) => this.barbearias.set(lista),
      error: () => this.mensagemErro.set('Falha ao carregar barbearias.'),
    });
  }

  protected criarBarbearia(): void {
    if (!this.barbeariaNome().trim()) {
      this.mensagemErro.set('Informe o nome da barbearia.');
      return;
    }
    this.limparMensagens();

    this.barbeariaServico
      .criar({
        nome: this.barbeariaNome().trim(),
        cidade: this.barbeariaCidade().trim() || null,
        estado: this.barbeariaEstado().trim() || null,
        telefone: this.barbeariaTelefone().trim() || null,
      })
      .subscribe({
        next: (criada) => {
          this.mensagemSucesso.set('Barbearia criada com sucesso.');
          this.barbeariaNome.set('');
          this.barbeariaCidade.set('');
          this.barbeariaEstado.set('');
          this.barbeariaTelefone.set('');
          this.barbearias.update((lista) => [...lista, criada]);
          this.selecionarBarbearia(criada.id);
        },
        error: (erro) => this.mostrarErro(erro),
      });
  }

  protected selecionarBarbearia(idBarbearia: number): void {
    this.barbeariaSelecionadaId.set(idBarbearia);
    this.barbeiroSelecionadoId.set(null);
    this.disponibilidades.set([]);
    this.limparMensagens();

    this.servicoServico.listarPorBarbearia(idBarbearia).subscribe({
      next: (lista) => this.servicos.set(lista),
      error: (erro) => this.mostrarErro(erro),
    });
    this.barbeiroServico.listarPorBarbearia(idBarbearia).subscribe({
      next: (lista) => this.barbeiros.set(lista),
      error: (erro) => this.mostrarErro(erro),
    });
  }

  // ===== Serviços ==========================================================

  protected criarServico(): void {
    const idBarbearia = this.barbeariaSelecionadaId();
    if (idBarbearia === null) {
      return;
    }
    if (!this.servicoNome().trim() || !this.servicoDuracao() || this.servicoPreco() === null) {
      this.mensagemErro.set('Preencha nome, duração e preço do serviço.');
      return;
    }
    this.limparMensagens();

    this.servicoServico
      .criar({
        id_barbearia: idBarbearia,
        nome: this.servicoNome().trim(),
        duracao_minutos: this.servicoDuracao()!,
        preco: this.servicoPreco()!,
      })
      .subscribe({
        next: (criado) => {
          this.mensagemSucesso.set('Serviço cadastrado.');
          this.servicoNome.set('');
          this.servicoDuracao.set(null);
          this.servicoPreco.set(null);
          this.servicos.update((lista) => [...lista, criado]);
        },
        error: (erro) => this.mostrarErro(erro),
      });
  }

  /** Entra no modo de edição de um serviço, preenchendo o formulário. */
  protected iniciarEdicaoServico(servico: Servico): void {
    this.servicoEmEdicaoId.set(servico.id);
    this.editServicoNome.set(servico.nome);
    this.editServicoDuracao.set(servico.duracao_minutos);
    this.editServicoPreco.set(servico.preco);
    this.limparMensagens();
  }

  /** Cancela a edição em andamento. */
  protected cancelarEdicaoServico(): void {
    this.servicoEmEdicaoId.set(null);
  }

  /** Salva as alterações do serviço em edição. */
  protected salvarEdicaoServico(id: number): void {
    if (!this.editServicoNome().trim() || !this.editServicoDuracao() || this.editServicoPreco() === null) {
      this.mensagemErro.set('Preencha nome, duração e preço do serviço.');
      return;
    }
    this.limparMensagens();

    this.servicoServico
      .atualizar(id, {
        nome: this.editServicoNome().trim(),
        duracao_minutos: this.editServicoDuracao()!,
        preco: this.editServicoPreco()!,
      })
      .subscribe({
        next: (atualizado) => {
          this.mensagemSucesso.set('Serviço atualizado.');
          this.servicoEmEdicaoId.set(null);
          this.substituirServico(atualizado);
        },
        error: (erro) => this.mostrarErro(erro),
      });
  }

  /** Ativa ou desativa um serviço (o back trata o campo "ativo"). */
  protected alternarAtivoServico(servico: Servico): void {
    this.limparMensagens();
    this.servicoServico.atualizar(servico.id, { ativo: !servico.ativo }).subscribe({
      next: (atualizado) => this.substituirServico(atualizado),
      error: (erro) => this.mostrarErro(erro),
    });
  }

  /** Substitui um serviço na lista pela versão atualizada. */
  private substituirServico(servico: Servico): void {
    this.servicos.update((lista) =>
      lista.map((s) => (s.id === servico.id ? servico : s)),
    );
  }

  // ===== Barbeiros =========================================================

  /** Seleciona o usuário que será vinculado como barbeiro. */
  protected selecionarUsuarioBarbeiro(usuario: Usuario): void {
    this.barbeiroIdUsuario.set(usuario.id);
    this.buscaUsuario.set('');
  }

  /** Limpa a seleção do usuário, voltando para a busca. */
  protected trocarUsuarioBarbeiro(): void {
    this.barbeiroIdUsuario.set(null);
    this.buscaUsuario.set('');
  }

  protected criarBarbeiro(): void {
    const idBarbearia = this.barbeariaSelecionadaId();
    if (idBarbearia === null) {
      return;
    }
    if (!this.barbeiroIdUsuario()) {
      this.mensagemErro.set('Selecione o usuário que será barbeiro.');
      return;
    }
    this.limparMensagens();

    this.barbeiroServico
      .criar({
        id_usuario: this.barbeiroIdUsuario()!,
        id_barbearia: idBarbearia,
        bio: this.barbeiroBio().trim() || null,
      })
      .subscribe({
        next: (criado) => {
          this.mensagemSucesso.set('Barbeiro cadastrado.');
          this.barbeiroIdUsuario.set(null);
          this.barbeiroBio.set('');
          this.buscaUsuario.set('');
          this.barbeiros.update((lista) => [...lista, criado]);
        },
        error: (erro) => this.mostrarErro(erro),
      });
  }

  protected selecionarBarbeiro(idBarbeiro: number): void {
    this.barbeiroSelecionadoId.set(idBarbeiro);
    this.limparMensagens();

    this.disponibilidadeServico.listarPorBarbeiro(idBarbeiro).subscribe({
      next: (lista) => this.disponibilidades.set(lista),
      error: (erro) => this.mostrarErro(erro),
    });
  }

  // ===== Disponibilidades ==================================================

  protected criarDisponibilidade(): void {
    const idBarbeiro = this.barbeiroSelecionadoId();
    if (idBarbeiro === null) {
      return;
    }
    this.limparMensagens();

    this.disponibilidadeServico
      .criar({
        id_barbeiro: idBarbeiro,
        dia_semana: this.dispDia(),
        hora_inicio: this.dispInicio(),
        hora_fim: this.dispFim(),
      })
      .subscribe({
        next: (criada) => {
          this.mensagemSucesso.set('Horário adicionado.');
          this.disponibilidades.update((lista) => [...lista, criada]);
        },
        error: (erro) => this.mostrarErro(erro),
      });
  }

  protected removerDisponibilidade(id: number): void {
    this.disponibilidadeServico.remover(id).subscribe({
      next: () => {
        this.disponibilidades.update((lista) =>
          lista.filter((faixa) => faixa.id !== id),
        );
      },
      error: (erro) => this.mostrarErro(erro),
    });
  }

  // ===== Auxiliares ========================================================

  protected nomeDoDia(diaSemana: number): string {
    return nomeDiaSemana(diaSemana);
  }

  /** Nome do usuário a partir do id (usa a lista já carregada). */
  protected nomeUsuario(idUsuario: number): string {
    return (
      this.usuarios().find((u) => u.id === idUsuario)?.nome ??
      `Usuário #${idUsuario}`
    );
  }

  private limparMensagens(): void {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
  }

  private mostrarErro(erro: unknown): void {
    this.mensagemErro.set(mensagemDeErro(erro, 'Ocorreu um erro na operação.'));
  }
}
