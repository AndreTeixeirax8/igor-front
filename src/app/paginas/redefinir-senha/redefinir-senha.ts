import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { Logotipo } from '../../compartilhado/logotipo/logotipo';
import { Mensagem } from '../../compartilhado/mensagem/mensagem';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';

/**
 * Tela de redefinição de senha, aberta a partir do link enviado por e-mail
 * (/redefinir-senha?token=...). Lê o token da URL, pede a nova senha e a
 * confirmação, e chama a API. Em caso de sucesso, oferece o caminho de volta ao
 * login.
 */
@Component({
  selector: 'app-redefinir-senha',
  imports: [FormsModule, RouterLink, Logotipo, Mensagem],
  templateUrl: './redefinir-senha.html',
  styleUrl: './redefinir-senha.scss',
})
export class RedefinirSenha {
  private readonly autenticacaoServico = inject(AutenticacaoServico);
  private readonly rotaAtual = inject(ActivatedRoute);

  /** Token lido da query string do link recebido por e-mail. */
  private readonly token = this.rotaAtual.snapshot.queryParamMap.get('token') ?? '';

  /** Indica se o link é válido (tem token). Sem token, nem mostramos o formulário. */
  protected readonly temToken = this.token.trim() !== '';

  protected novaSenha = signal('');
  protected confirmacaoSenha = signal('');

  protected readonly carregando = signal(false);
  protected readonly mensagemErro = signal('');

  /** Quando true, a senha foi trocada e mostramos a tela de sucesso. */
  protected readonly concluido = signal(false);

  /** Valida os campos e chama a API para efetivar a nova senha. */
  protected aoEnviar(): void {
    if (this.novaSenha().length < 6) {
      this.mensagemErro.set('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (this.novaSenha() !== this.confirmacaoSenha()) {
      this.mensagemErro.set('As senhas não conferem.');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.autenticacaoServico.redefinirSenha(this.token, this.novaSenha()).subscribe({
      next: () => {
        this.carregando.set(false);
        this.concluido.set(true);
      },
      error: (erro: unknown) => {
        this.carregando.set(false);
        this.mensagemErro.set(
          mensagemDeErro(
            erro,
            'Não foi possível redefinir a senha. O link pode ter expirado; peça um novo.',
          ),
        );
      },
    });
  }
}
