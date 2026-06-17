import { Component, input } from '@angular/core';

/**
 * Logotipo da barbearia "Igor Style's".
 *
 * Exibe a imagem oficial do logo (um círculo dourado com o nome escrito à mão),
 * que deve estar salva em "public/logo.png". A propriedade "tamanho" controla o
 * diâmetro da imagem em pixels.
 *
 * Caso o arquivo de imagem ainda não exista, é exibido um substituto textual
 * com o nome da marca, para a interface nunca ficar "quebrada".
 */
@Component({
  selector: 'app-logotipo',
  template: `
    <span class="logotipo" [style.--tamanho-icone.px]="tamanho()">
      <img
        class="logotipo__imagem"
        src="logo.png"
        alt="Igor Style's Barbearia"
        (error)="aoFalharImagem()"
        [hidden]="imagemFalhou"
      />

      @if (imagemFalhou) {
        <!-- Substituto exibido quando a imagem do logo não é encontrada. -->
        <span class="logotipo__substituto">
          Igor <span class="logotipo__destaque">Style's</span>
        </span>
      }
    </span>
  `,
  styleUrl: './logotipo.scss',
})
export class Logotipo {
  /** Diâmetro do logo em pixels. */
  readonly tamanho = input<number>(48);

  /** Sinaliza que a imagem do logo não pôde ser carregada. */
  protected imagemFalhou = false;

  /**
   * Chamado quando o navegador não consegue carregar a imagem do logo
   * (arquivo ausente). Ativa a exibição do substituto textual.
   */
  protected aoFalharImagem(): void {
    this.imagemFalhou = true;
  }
}
