/**
 * Modelos da gamificação (pontos, XP e níveis).
 *
 * Regra central: existem DUAS contagens no cliente.
 *  - `xp_total`     — acumulado vitalício, só cresce; é o que define o nível;
 *  - `saldo_pontos` — a carteira gastável (futura lojinha).
 * Gastar pontos na loja mexe só no saldo, então o nível nunca é perdido.
 */

/**
 * Progresso do cliente, já calculado pelo back-end. O front apenas exibe: se a
 * escada de níveis mudar, nenhuma tela precisa ser alterada.
 */
export interface ProgressoGamificacao {
  xp_total: number;
  saldo_pontos: number;

  nivel: number;
  nome_nivel: string;

  /** Quanto já andou dentro do nível atual e o tamanho total desse degrau. */
  xp_no_nivel_atual: number;
  xp_para_proximo_nivel: number;
  /** Quanto falta para subir (0 quando já está no nível máximo). */
  xp_faltando: number;
  /** De 0 a 100, pronto para a barra de progresso. */
  progresso_percentual: number;

  /** Nulos quando o cliente já está no último degrau. */
  proximo_nivel: number | null;
  nome_proximo_nivel: string | null;
  eh_nivel_maximo: boolean;
}

/** Um degrau da escada de níveis. */
export interface Nivel {
  nivel: number;
  nome: string;
  xp_necessario: number;
}

/** Tipos de movimentação do extrato de pontos. */
export type TipoMovimentacao = 'ganho_servico' | 'resgate' | 'ajuste_manual';

/** Uma linha do extrato de pontos. Quantidade positiva credita; negativa debita. */
export interface MovimentacaoPontos {
  id: number;
  id_agendamento: number | null;
  tipo: TipoMovimentacao;
  quantidade: number;
  descricao: string | null;
  criado_em: string;
}

/** Rótulo amigável para o tipo de movimentação. */
export function rotuloTipoMovimentacao(tipo: TipoMovimentacao): string {
  const rotulos: Record<TipoMovimentacao, string> = {
    ganho_servico: 'Atendimento concluído',
    resgate: 'Troca por produto',
    ajuste_manual: 'Ajuste da barbearia',
  };
  return rotulos[tipo] ?? tipo;
}
