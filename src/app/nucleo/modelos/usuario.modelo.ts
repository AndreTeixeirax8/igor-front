/**
 * Representação pública de um usuário, exatamente como o back-end devolve no
 * campo "usuario" das respostas de autenticação e na rota /usuarios/me.
 *
 * Os nomes dos campos seguem o JSON do back-end (em português, snake_case).
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: PerfilUsuario;
  url_avatar: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Perfis aceitos pelo sistema. Refletem o ENUM "perfil_usuario" do banco e as
 * constantes definidas no back-end (pacote usuario).
 */
export type PerfilUsuario = 'cliente' | 'barbeiro' | 'dono' | 'admin';

/**
 * Devolve um rótulo amigável (para exibição na tela) a partir do perfil técnico.
 */
export function rotuloDoPerfil(perfil: PerfilUsuario): string {
  const rotulos: Record<PerfilUsuario, string> = {
    cliente: 'Cliente',
    barbeiro: 'Barbeiro',
    dono: 'Dono da barbearia',
    admin: 'Administrador',
  };
  return rotulos[perfil] ?? perfil;
}
