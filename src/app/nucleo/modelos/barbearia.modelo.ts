/**
 * Representação pública de uma barbearia, como o back-end devolve.
 */
export interface Barbearia {
  id: number;
  id_dono: number;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  url_logo: string | null;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Dados enviados para criar uma barbearia.
 * Lembrete: "estado" é a sigla da UF (ex.: "SC"), pois a coluna tem 2 caracteres.
 */
export interface DadosCriacaoBarbearia {
  nome: string;
  descricao?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  url_logo?: string | null;
}
