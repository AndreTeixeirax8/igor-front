import { Usuario } from './usuario.modelo';

/**
 * Credenciais enviadas para a rota POST /auth/login.
 * Os nomes dos campos seguem o que o back-end espera no corpo da requisição.
 */
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

/**
 * Resposta devolvida pelo back-end em um login (ou registro) bem-sucedido.
 * Contém o token JWT e os dados públicos do usuário autenticado.
 */
export interface RespostaAutenticacao {
  token: string;
  usuario: Usuario;
}

/**
 * Formato padrão de erro devolvido pela API (campo "erro" com a mensagem).
 */
export interface RespostaErroApi {
  erro: string;
}
