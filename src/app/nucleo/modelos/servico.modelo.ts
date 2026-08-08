/**
 * Representação pública de um serviço oferecido por uma barbearia.
 */
export interface Servico {
  id: number;
  id_barbearia: number;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  /** Pontos de gamificação que o cliente ganha ao concluir este serviço. */
  pontos: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Dados enviados para cadastrar um serviço.
 */
export interface DadosCriacaoServico {
  id_barbearia: number;
  nome: string;
  descricao?: string | null;
  duracao_minutos: number;
  preco: number;
  pontos: number;
}

/**
 * Dados enviados para editar um serviço. Todos os campos são opcionais: envie
 * apenas o que mudar.
 */
export interface DadosAtualizacaoServico {
  nome?: string;
  descricao?: string | null;
  duracao_minutos?: number;
  preco?: number;
  pontos?: number;
  ativo?: boolean;
}
