import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { Logotipo } from '../../compartilhado/logotipo/logotipo';
import { RespostaErroApi } from '../../nucleo/modelos/autenticacao.modelo';

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
  private readonly roteador = inject(Router);

  /** Valores digitados nos campos do formulário (ligados via ngModel). */
  protected nome = signal('');
  protected email = signal('');
  protected telefone = signal('');
  protected senha = signal('');
  protected confirmacaoSenha = signal('');

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
        next: () => {
          // Conta criada: volta para o login sinalizando o sucesso, para que a
          // pessoa entre com as próprias credenciais.
          this.roteador.navigate(['/login'], {
            queryParams: { cadastroRealizado: '1' },
          });
        },
        error: (erro: HttpErrorResponse) => {
          this.carregando.set(false);
          this.mensagemErro.set(this.traduzirErro(erro));
        },
      });
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
