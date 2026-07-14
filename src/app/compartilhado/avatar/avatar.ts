import { Component, input, computed } from '@angular/core';

import { calcularIniciais } from '../../nucleo/util/iniciais';

/**
 * Avatar circular do usuário. Mostra a foto de perfil quando ela existe
 * (`url`); caso contrário, exibe as iniciais do nome sobre um círculo dourado.
 *
 * Reaproveitado em todo lugar que precisa representar um usuário: topo do
 * painel, tabela de clientes e tela de perfil. Antes esse "foto ou iniciais"
 * estava copiado em cada uma dessas telas.
 */
@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="avatar"
      [style.width.px]="tamanho()"
      [style.height.px]="tamanho()"
      [style.font-size.px]="tamanho() * 0.38"
    >
      @if (url()) {
        <img class="avatar__imagem" [src]="url()" [alt]="'Foto de ' + nome()" />
      } @else {
        {{ iniciais() }}
      }
    </span>
  `,
  styleUrl: './avatar.scss',
})
export class Avatar {
  /** Nome do usuário — usado para calcular as iniciais quando não há foto. */
  readonly nome = input<string>('');

  /** Caminho da foto de perfil (ex.: /api/img/usuarios/1_123.png) ou nulo. */
  readonly url = input<string | null>(null);

  /** Diâmetro do avatar em pixels. */
  readonly tamanho = input<number>(40);

  /** Iniciais exibidas quando não há foto. */
  protected readonly iniciais = computed(() => calcularIniciais(this.nome()));
}
