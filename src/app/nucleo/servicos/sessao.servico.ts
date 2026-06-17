import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from '../modelos/usuario.modelo';

/**
 * Chaves usadas para guardar os dados da sessão no armazenamento local do
 * navegador (localStorage), permitindo que o usuário continue logado mesmo
 * depois de recarregar a página.
 */
const CHAVE_TOKEN = 'barbeariax.token';
const CHAVE_USUARIO = 'barbeariax.usuario';

/**
 * Serviço responsável por guardar e recuperar os dados da sessão do usuário
 * (token JWT e dados do usuário autenticado). Usa "signals" do Angular para que
 * a interface reaja automaticamente quando o usuário entra ou sai.
 */
@Injectable({ providedIn: 'root' })
export class SessaoServico {
  /** Token JWT atual; nulo quando ninguém está autenticado. */
  private readonly tokenAtual = signal<string | null>(this.lerTokenSalvo());

  /** Usuário autenticado atual; nulo quando ninguém está autenticado. */
  private readonly usuarioAtual = signal<Usuario | null>(this.lerUsuarioSalvo());

  /** Sinal somente-leitura com o usuário autenticado (ou nulo). */
  readonly usuario = this.usuarioAtual.asReadonly();

  /** Indica, de forma reativa, se existe um usuário autenticado no momento. */
  readonly estaAutenticado = computed(() => this.tokenAtual() !== null);

  /**
   * Salva os dados da sessão após um login bem-sucedido, tanto na memória
   * (signals) quanto no localStorage (para sobreviver a recarregamentos).
   */
  iniciarSessao(token: string, usuario: Usuario): void {
    this.tokenAtual.set(token);
    this.usuarioAtual.set(usuario);

    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  }

  /**
   * Encerra a sessão atual, limpando os dados da memória e do localStorage.
   */
  encerrarSessao(): void {
    this.tokenAtual.set(null);
    this.usuarioAtual.set(null);

    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
  }

  /**
   * Devolve o token JWT atual (ou nulo). Usado pelo interceptador para anexar
   * o cabeçalho Authorization nas requisições à API.
   */
  obterToken(): string | null {
    return this.tokenAtual();
  }

  /**
   * Lê o token salvo no localStorage quando o serviço é criado.
   */
  private lerTokenSalvo(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  /**
   * Lê e converte o usuário salvo no localStorage quando o serviço é criado.
   * Em caso de dado corrompido, devolve nulo para não quebrar a aplicação.
   */
  private lerUsuarioSalvo(): Usuario | null {
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);
    if (!usuarioSalvo) {
      return null;
    }

    try {
      return JSON.parse(usuarioSalvo) as Usuario;
    } catch {
      return null;
    }
  }
}
