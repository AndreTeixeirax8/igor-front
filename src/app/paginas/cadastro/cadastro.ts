import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';
import { Logotipo } from '../../compartilhado/logotipo/logotipo';
import { RespostaErroApi } from '../../nucleo/modelos/autenticacao.modelo';
import { validarArquivoFoto } from '../../nucleo/util/validacao-foto';

/**
 * Tela de cadastro de uma nova conta. Coleta nome, e-mail, telefone (opcional)
 * e senha, cria a conta na API e, em caso de sucesso, leva o usuário de volta
 * à tela de login para que ele se autentique.
 */
@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, RouterLink, Logotipo],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  private readonly autenticacaoServico = inject(AutenticacaoServico);
  private readonly usuarioServico = inject(UsuarioServico);
  private readonly roteador = inject(Router);

  /** Valores digitados nos campos do formulário (ligados via ngModel). */
  protected nome = signal('');
  protected email = signal('');
  protected telefone = signal('');
  protected senha = signal('');
  protected confirmacaoSenha = signal('');

  /** Foto de perfil escolhida (opcional) e a prévia exibida na tela. */
  protected readonly fotoSelecionada = signal<File | null>(null);
  protected readonly previaFoto = signal<string | null>(null);

  /** Indica que o cadastro está em andamento (desabilita o botão). */
  protected readonly carregando = signal(false);

  /** Mensagem de erro a ser exibida; vazia quando não há erro. */
  protected readonly mensagemErro = signal('');

  /**
   * Executado ao enviar o formulário. Valida os campos, cria a conta e, ao dar
   * certo, redireciona para o login com um aviso de sucesso.
   */
  protected aoEnviar(): void {
    const erroValidacao = this.validarFormulario();
    if (erroValidacao) {
      this.mensagemErro.set(erroValidacao);
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    // O telefone é opcional: enviamos nulo quando não preenchido.
    const telefoneInformado = this.telefone().trim();

    this.autenticacaoServico
      .cadastrar({
        nome: this.nome().trim(),
        email: this.email().trim(),
        telefone: telefoneInformado === '' ? null : telefoneInformado,
        senha: this.senha(),
      })
      .subscribe({
        next: (resposta) => {
          const foto = this.fotoSelecionada();

          // Sem foto: encerra o fluxo indo direto para o login.
          if (!foto) {
            this.irParaLogin();
            return;
          }

          // Com foto: envia usando o token que o registro devolveu (ainda não
          // há sessão iniciada, então o interceptador não tem o que anexar).
          // Se o envio da foto falhar, seguimos para o login mesmo assim — a
          // conta já foi criada e a foto pode ser adicionada depois na edição.
          this.usuarioServico
            .enviarFoto(resposta.usuario.id, foto, resposta.token)
            .subscribe({
              next: () => this.irParaLogin(),
              error: () => this.irParaLogin(),
            });
        },
        error: (erro: HttpErrorResponse) => {
          this.carregando.set(false);
          this.mensagemErro.set(this.traduzirErro(erro));
        },
      });
  }

  /**
   * Chamado quando o usuário escolhe um arquivo de foto. Valida tipo e tamanho
   * e monta a prévia exibida no formulário.
   */
  protected aoSelecionarFoto(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const arquivo = entrada.files?.[0] ?? null;
    if (!arquivo) {
      return;
    }

    const erroValidacao = validarArquivoFoto(arquivo);
    if (erroValidacao) {
      this.mensagemErro.set(erroValidacao);
      entrada.value = '';
      return;
    }

    this.mensagemErro.set('');
    this.liberarPrevia();
    this.fotoSelecionada.set(arquivo);
    this.previaFoto.set(URL.createObjectURL(arquivo));
  }

  /** Remove a foto escolhida (o cadastro segue sem foto). */
  protected removerFoto(): void {
    this.liberarPrevia();
    this.fotoSelecionada.set(null);
    this.previaFoto.set(null);
  }

  /** Volta para a tela de login sinalizando que o cadastro deu certo. */
  private irParaLogin(): void {
    this.liberarPrevia();
    this.roteador.navigate(['/login'], {
      queryParams: { cadastroRealizado: '1' },
    });
  }

  /** Libera da memória a URL temporária usada na prévia da foto. */
  private liberarPrevia(): void {
    const previa = this.previaFoto();
    if (previa) {
      URL.revokeObjectURL(previa);
    }
  }

  /**
   * Valida o preenchimento do formulário antes de enviar à API.
   * @returns A mensagem de erro encontrada, ou string vazia se estiver tudo ok.
   */
  private validarFormulario(): string {
    if (!this.nome().trim()) {
      return 'Informe o seu nome.';
    }
    if (!this.email().trim()) {
      return 'Informe o seu e-mail.';
    }
    if (this.senha().length < 6) {
      return 'A senha deve ter ao menos 6 caracteres.';
    }
    if (this.senha() !== this.confirmacaoSenha()) {
      return 'As senhas não conferem.';
    }
    return '';
  }

  /**
   * Converte o erro HTTP em uma mensagem clara, aproveitando o campo "erro" do
   * corpo padronizado do back-end quando ele existir.
   */
  private traduzirErro(erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return 'Não foi possível falar com o servidor. Verifique se o back-end está no ar.';
    }

    const corpo = erro.error as RespostaErroApi | null;
    if (corpo?.erro) {
      return corpo.erro;
    }

    return 'Não foi possível criar a conta. Tente novamente.';
  }
}
