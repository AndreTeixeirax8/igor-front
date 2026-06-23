import { Injectable } from '@angular/core';

/** Chave usada para guardar as credenciais lembradas no navegador. */
const CHAVE_CREDENCIAIS = 'barbeariax.credenciais-lembradas';

/**
 * Estrutura das credenciais guardadas no navegador quando o usuário marca a
 * opção "Lembrar-me" na tela de login.
 */
export interface CredenciaisLembradas {
  email: string;
  senha: string;
}

/**
 * Serviço responsável por lembrar (e esquecer) as credenciais de login no
 * navegador do cliente, para que ele não precise digitá-las toda vez.
 *
 * ATENÇÃO (segurança): a senha fica guardada em texto puro no localStorage.
 * Isso é conveniente em um aparelho de uso pessoal, mas qualquer pessoa com
 * acesso ao navegador conseguiria lê-la. Por isso a opção vem desmarcada por
 * padrão e só guarda algo quando o próprio usuário escolhe.
 */
@Injectable({ providedIn: 'root' })
export class CredenciaisLembradasServico {
  /**
   * Guarda o e-mail e a senha no navegador.
   */
  salvar(credenciais: CredenciaisLembradas): void {
    localStorage.setItem(CHAVE_CREDENCIAIS, JSON.stringify(credenciais));
  }

  /**
   * Remove as credenciais guardadas (quando o usuário desmarca "Lembrar-me").
   */
  limpar(): void {
    localStorage.removeItem(CHAVE_CREDENCIAIS);
  }

  /**
   * Recupera as credenciais guardadas, ou nulo se não houver nenhuma (ou se o
   * dado estiver corrompido).
   */
  obter(): CredenciaisLembradas | null {
    const dadoSalvo = localStorage.getItem(CHAVE_CREDENCIAIS);
    if (!dadoSalvo) {
      return null;
    }

    try {
      return JSON.parse(dadoSalvo) as CredenciaisLembradas;
    } catch {
      return null;
    }
  }
}
