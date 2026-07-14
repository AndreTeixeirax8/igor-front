/**
 * Calcula as iniciais (até duas letras, em maiúsculas) a partir de um nome.
 * Usa a primeira letra do primeiro nome e a primeira do último sobrenome.
 *
 * Ex.: "Igor Souza Lima" → "IL"; "Ana" → "A".
 *
 * Centralizado aqui porque essa mesma conta aparecia repetida em várias telas
 * (avatar do topo, tabela de clientes, perfil...).
 */
export function calcularIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.charAt(0) ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return (primeira + ultima).toUpperCase();
}
