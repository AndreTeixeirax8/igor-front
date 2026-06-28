/**
 * Funções utilitárias de data/hora usadas na integração com o back-end.
 */

/**
 * Converte o valor de um <input type="datetime-local"> (ex.: "2026-07-25T16:00")
 * para o formato RFC 3339 com o deslocamento de fuso local (ex.:
 * "2026-07-25T16:00:00-03:00"), que é o formato que o back-end espera em
 * "inicio_em".
 *
 * É importante enviar com o fuso local (e não em UTC), porque o back valida o
 * dia da semana e o horário usando o relógio informado.
 */
export function paraRFC3339ComFusoLocal(valorDatetimeLocal: string): string {
  const data = new Date(valorDatetimeLocal);

  // getTimezoneOffset devolve minutos ATRÁS do UTC; invertemos para ter o sinal
  // correto do deslocamento (ex.: Brasil = -180 min => "-03:00").
  const deslocamentoMinutos = -data.getTimezoneOffset();
  const sinal = deslocamentoMinutos >= 0 ? '+' : '-';
  const absoluto = Math.abs(deslocamentoMinutos);
  const horas = String(Math.floor(absoluto / 60)).padStart(2, '0');
  const minutos = String(absoluto % 60).padStart(2, '0');

  return `${valorDatetimeLocal}:00${sinal}${horas}:${minutos}`;
}

/**
 * Formata uma data ISO (RFC 3339) para exibição amigável em português,
 * ex.: "25/07/2026 às 16:00".
 */
export function formatarDataHora(dataIso: string): string {
  const data = new Date(dataIso);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dataFormatada} às ${horaFormatada}`;
}
