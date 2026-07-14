import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AutenticacaoServico } from '../../nucleo/servicos/autenticacao.servico';
import { CredenciaisLembradasServico } from '../../nucleo/servicos/credenciais-lembradas.servico';
import { Logotipo } from '../../compartilhado/logotipo/logotipo';
import { Mensagem } from '../../compartilhado/mensagem/mensagem';
import { mensagemDeErro } from '../../nucleo/util/mensagem-erro';

/**
 * Tela de login. Coleta e-mail e senha, chama o serviço de autenticação e, em
 * caso de sucesso, leva o usuário para a tela principal. Mensagens de erro
 * vindas do back-end são exibidas de forma amigável.
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Logotipo, Mensagem],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly autenticacaoServico = inject(AutenticacaoServico);
  private readonly credenciaisLembradas = inject(CredenciaisLembradasServico);
  private readonly roteador = inject(Router);
  private readonly rotaAtual = inject(ActivatedRoute);

  /** Valores digitados nos campos do formulário (ligados via ngModel). */
  protected email = signal('');
  protected senha = signal('');

  /** Estado do checkbox "Lembrar-me". */
  protected lembrarMe = signal(false);

  /** Indica que a requisição de login está em andamento (desabilita o botão). */
  protected readonly carregando = signal(false);

  /** Mensagem de erro a ser exibida; vazia quando não há erro. */
  protected readonly mensagemErro = signal('');

  /**
   * Mensagem de sucesso (ex.: vinda da tela de cadastro). Vazia quando não há.
   * É preenchida quando o login é aberto com o parâmetro "cadastroRealizado".
   */
  protected readonly mensagemSucesso = signal(
    this.rotaAtual.snapshot.queryParamMap.get('cadastroRealizado') === '1'
      ? 'Conta criada com sucesso! Agora é só entrar com seus dados.'
      : '',
  );

  constructor() {
    // Se houver credenciais lembradas de um acesso anterior, já preenche os
    // campos e deixa o checkbox marcado, evitando que o usuário redigite.
    const salvas = this.credenciaisLembradas.obter();
    if (salvas) {
      this.email.set(salvas.email);
      this.senha.set(salvas.senha);
      this.lembrarMe.set(true);
    }
  }

  /**
   * Executado ao enviar o formulário. Valida o preenchimento, dispara o login
   * e trata as respostas de sucesso e de erro.
   */
  protected aoEnviar(): void {
    // Validação simples: ambos os campos são obrigatórios.
    if (!this.email().trim() || !this.senha().trim()) {
      this.mensagemErro.set('Informe o e-mail e a senha para continuar.');
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.autenticacaoServico
      .entrar({ email: this.email().trim(), senha: this.senha() })
      .subscribe({
        next: () => {
          // De acordo com a opção "Lembrar-me", guarda ou apaga as credenciais
          // no navegador para o próximo acesso.
          if (this.lembrarMe()) {
            this.credenciaisLembradas.salvar({
              email: this.email().trim(),
              senha: this.senha(),
            });
          } else {
            this.credenciaisLembradas.limpar();
          }

          // Login bem-sucedido: navega para a tela principal.
          this.roteador.navigate(['/principal']);
        },
        error: (erro: unknown) => {
          this.carregando.set(false);
          this.mensagemErro.set(
            mensagemDeErro(erro, 'Ocorreu um erro ao tentar entrar. Tente novamente.'),
          );
        },
      });
  }
}
