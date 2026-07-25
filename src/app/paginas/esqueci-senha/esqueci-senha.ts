import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { Logotipo } from '../../compartilhado/logotipo/logotipo';
import { Mensagem } from '../../compartilhado/mensagem/mensagem';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';

/**
 * Tela "esqueci minha senha": a pessoa informa o e-mail e recebe um link para
 * redefinir a senha. Por segurança, a resposta é sempre a mesma (exista ou não
 * o e-mail cadastrado), então nunca revelamos se aquele e-mail existe.
 */
@Component({
  selector: 'app-esqueci-senha',
  imports: [FormsModule, RouterLink, Logotipo, Mensagem],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.scss',
})
export class EsqueciSenha {
  private readonly autenticacaoServico = inject(AutenticacaoServico);

  /** E-mail digitado (ligado via ngModel). */
  protected email = signal('');

  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly mensagemSucesso = signal('');

  /** Envia a solicitação de redefinição para a API. */
  protected aoEnviar(): void {
    if (!this.email().trim()) {
      this.mensagemErro.set('Informe o seu e-mail.');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    this.autenticacaoServico.solicitarRedefinicaoSenha(this.email().trim()).subscribe({
      next: (resposta) => {
        this.carregando.set(false);
        // A mensagem vem do back e é genérica de propósito.
        this.mensagemSucesso.set(resposta.mensagem);
      },
      error: (erro: unknown) => {
        this.carregando.set(false);
        this.mensagemErro.set(
          mensagemDeErro(erro, 'Não foi possível processar a solicitação. Tente novamente.'),
        );
      },
    });
  }
}
