/**
 * Representação pública de uma faixa de horário de atendimento de um barbeiro.
 * dia_semana segue a convenção 0=domingo ... 6=sábado.
 * hora_inicio e hora_fim vêm no formato "HH:MM".
 */
export interface Disponibilidade {
  id: number;
  id_barbeiro: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
}

/**
 * Dados enviados para cadastrar uma faixa de disponibilidade.
 */
export interface DadosCriacaoDisponibilidade {
  id_barbeiro: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
}

/**
 * Nomes dos dias da semana, indexados pela convenção do back (0=domingo).
 */
export const NOMES_DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/**
 * Devolve o nome do dia da semana a partir do número (0 a 6).
 */
export function nomeDiaSemana(diaSemana: number): string {
  return NOMES_DIAS_SEMANA[diaSemana] ?? '—';
}
