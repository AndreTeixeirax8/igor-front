/**
 * Representação pública de um barbeiro (usuário vinculado a uma barbearia).
 */
export interface Barbeiro {
  id: number;
  id_usuario: number;
  id_barbearia: number;
  bio: string | null;
  nota_media: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Dados enviados para cadastrar um barbeiro em uma barbearia.
 */
export interface DadosCriacaoBarbeiro {
  id_usuario: number;
  id_barbearia: number;
  bio?: string | null;
}
