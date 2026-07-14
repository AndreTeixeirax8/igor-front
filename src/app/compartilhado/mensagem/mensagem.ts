import { Component, input } from '@angular/core';

/** Tipos de mensagem de feedback exibidos ao usuário. */
export type TipoMensagem = 'erro' | 'sucesso';

/**
 * Faixa de mensagem de feedback (erro ou sucesso) exibida no topo de uma tela
 * ou de um formulário. Não aparece nada quando o texto está vazio, então dá
 * para deixá-la fixa no template e apenas preencher o texto quando necessário.
 *
 * Uso: `<app-mensagem tipo="erro" [texto]="mensagemErro()" />`.
 *
 * Antes, cada tela repetia o mesmo HTML + estilos de "caixinha de erro/sucesso".
 */
@Component({
  selector: 'app-mensagem',
  template: `
    @if (texto()) {
      <p class="mensagem mensagem--{{ tipo() }}">{{ texto() }}</p>
    }
  `,
  styleUrl: './mensagem.scss',
})
export class Mensagem {
  /** Tipo visual da mensagem: 'erro' (vermelho) ou 'sucesso' (verde). */
  readonly tipo = input<TipoMensagem>('erro');

  /** Texto a exibir. Vazio = nada é renderizado. */
  readonly texto = input<string>('');
}
