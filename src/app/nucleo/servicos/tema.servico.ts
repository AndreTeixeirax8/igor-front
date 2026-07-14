import { Injectable, signal } from '@angular/core';

/** Temas visuais disponíveis. */
export type Tema = 'escuro' | 'claro';

/** Chave usada para lembrar a escolha de tema no navegador. */
const CHAVE_TEMA = 'barbeariax.tema';

/**
 * Serviço que controla o tema visual (escuro/claro) da aplicação.
 *
 * Como funciona: o tema é aplicado escrevendo o atributo `data-tema` no elemento
 * <html>. O CSS (em styles.scss) já traz o tema claro como um bloco que
 * sobrescreve as variáveis de cor quando `data-tema="claro"`. Assim, trocar de
 * tema é só mudar esse atributo — nenhum componente precisa saber qual tema
 * está ativo.
 *
 * A escolha é guardada no localStorage para o usuário reencontrar o mesmo tema
 * no próximo acesso. O tema escuro é o padrão (identidade da barbearia).
 */
@Injectable({ providedIn: 'root' })
export class TemaServico {
  /** Tema atual, exposto de forma reativa para a interface (ex.: o botão). */
  private readonly temaAtual = signal<Tema>(this.lerTemaSalvo());

  /** Sinal somente-leitura com o tema em uso. */
  readonly tema = this.temaAtual.asReadonly();

  constructor() {
    // Aplica o tema salvo assim que o serviço é criado (no início da aplicação).
    this.aplicarNoDocumento(this.temaAtual());
  }

  /** Define explicitamente um tema. */
  definir(tema: Tema): void {
    this.temaAtual.set(tema);
    this.aplicarNoDocumento(tema);
    localStorage.setItem(CHAVE_TEMA, tema);
  }

  /** Alterna entre escuro e claro. */
  alternar(): void {
    this.definir(this.temaAtual() === 'escuro' ? 'claro' : 'escuro');
  }

  /**
   * Escreve o atributo `data-tema` no <html>. Para o tema escuro (padrão)
   * removemos o atributo, deixando valer as variáveis do :root.
   */
  private aplicarNoDocumento(tema: Tema): void {
    const raiz = document.documentElement;
    if (tema === 'claro') {
      raiz.setAttribute('data-tema', 'claro');
    } else {
      raiz.removeAttribute('data-tema');
    }
  }

  /**
   * Lê o tema salvo no localStorage. Se não houver (ou for inválido), assume o
   * tema escuro, que é o padrão da identidade visual.
   */
  private lerTemaSalvo(): Tema {
    return localStorage.getItem(CHAVE_TEMA) === 'claro' ? 'claro' : 'escuro';
  }
}
