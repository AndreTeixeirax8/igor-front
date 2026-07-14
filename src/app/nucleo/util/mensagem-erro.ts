import { HttpErrorResponse } from '@angular/common/http';

/**
 * Formato padronizado de erro devolvido pelo back-end: `{ "erro": "mensagem" }`.
 */
interface RespostaErroApi {
  erro?: string;
}

/**
 * Converte um erro HTTP em uma mensagem clara em português para exibir ao
 * usuário. Centraliza aqui a lógica que antes se repetia em várias telas
 * (cada uma tinha o seu "traduzirErro").
 *
 * A ordem de decisão é:
 *  1. servidor fora do ar (status 0) → mensagem específica;
 *  2. mensagem enviada pelo back no campo "erro" → usa ela (é a mais precisa);
 *  3. senão → a mensagem padrão informada por quem chamou.
 *
 * @param erro   O erro capturado (normalmente um HttpErrorResponse).
 * @param padrao Mensagem a exibir quando não há uma mais específica.
 */
export function mensagemDeErro(
  erro: unknown,
  padrao = 'Não foi possível concluir a ação. Tente novamente.',
): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível falar com o servidor. Verifique se o back-end está no ar.';
    }

    const corpo = erro.error as RespostaErroApi | null;
    if (corpo?.erro) {
      return corpo.erro;
    }
  }

  return padrao;
}
