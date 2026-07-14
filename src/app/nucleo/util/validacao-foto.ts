/**
 * Validação da foto de perfil no navegador, antes do envio.
 *
 * Importante: esta checagem existe só para dar um retorno rápido ao usuário.
 * A validação de verdade (extensão + assinatura dos bytes + decodificação da
 * imagem) é feita no back-end, que é quem garante que nenhum arquivo malicioso
 * seja salvo no lugar da foto.
 */

/** Tamanho máximo aceito para a foto (5 MB — mesmo limite do back-end). */
export const TAMANHO_MAXIMO_FOTO_BYTES = 5 * 1024 * 1024;

/** Tipos de imagem aceitos (PNG e JPG). */
export const TIPOS_FOTO_ACEITOS = ['image/png', 'image/jpeg'];

/**
 * Valida o arquivo escolhido como foto de perfil.
 * @returns A mensagem de erro encontrada, ou string vazia se o arquivo é aceito.
 */
export function validarArquivoFoto(arquivo: File): string {
  if (!TIPOS_FOTO_ACEITOS.includes(arquivo.type)) {
    return 'A foto deve ser uma imagem PNG ou JPG.';
  }
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
    return 'A foto deve ter no máximo 5 MB.';
  }
  return '';
}
