/**
 * Status possíveis de um agendamento (espelham o ENUM do banco).
 */
export type StatusAgendamento =
  | 'agendado'
  | 'confirmado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'nao_compareceu';

/**
 * Representação pública de um agendamento, como o back-end devolve.
 */
export interface Agendamento {
  id: number;
  id_cliente: number;
  id_barbeiro: number;
  id_servico: number;
  inicio_em: string;
  fim_em: string;
  status: StatusAgendamento;
  observacoes: string | null;
  preco_no_agendamento: number;
  cancelado_em: string | null;
  cancelado_por: number | null;
  motivo_cancelamento: string | null;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Horários livres de um barbeiro em um dia específico.
 * "data" no formato "AAAA-MM-DD"; "horarios" no formato "HH:MM".
 */
export interface HorariosDia {
  data: string;
  horarios: string[];
}

/**
 * Dados enviados para criar um agendamento. O cliente é sempre o usuário
 * autenticado (não vai no corpo). "inicio_em" deve estar no formato RFC 3339.
 */
export interface DadosCriacaoAgendamento {
  id_barbeiro: number;
  id_servico: number;
  inicio_em: string;
  observacoes?: string | null;
}

/**
 * Devolve um rótulo amigável (para exibição) a partir do status técnico.
 */
export function rotuloStatus(status: StatusAgendamento): string {
  const rotulos: Record<StatusAgendamento, string> = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    nao_compareceu: 'Não compareceu',
  };
  return rotulos[status] ?? status;
}

/**
 * Indica se o agendamento já chegou a um status final (não pode mais mudar).
 */
export function statusEncerrado(status: StatusAgendamento): boolean {
  return (
    status === 'concluido' ||
    status === 'cancelado' ||
    status === 'nao_compareceu'
  );
}
