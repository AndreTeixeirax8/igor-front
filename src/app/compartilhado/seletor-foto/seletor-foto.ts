import {
  Component,
  input,
  output,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';

import { Avatar } from '../avatar/avatar';
import { Mensagem } from '../mensagem/mensagem';
import { validarArquivoFoto } from '../../nucleo/util/validacao-foto';

/**
 * Seletor de foto de perfil: mostra a foto atual (ou as iniciais), permite
 * escolher uma nova imagem (PNG/JPG), valida tipo/tamanho no navegador, exibe a
 * prévia e emite o arquivo escolhido pelo evento `mudou`.
 *
 * Quem usa só precisa reagir ao `mudou(File | null)` e enviar o arquivo à API
 * na hora de salvar. A validação de verdade é feita no back-end; a daqui é só
 * um retorno rápido ao usuário.
 *
 * Reaproveitado no cadastro, na edição de clientes e na tela "Meu perfil" —
 * antes essa lógica de prévia + validação estava copiada nas três.
 */
@Component({
  selector: 'app-seletor-foto',
  imports: [Avatar, Mensagem],
  templateUrl: './seletor-foto.html',
  styleUrl: './seletor-foto.scss',
})
export class SeletorFoto {
  /** Contador estático usado para gerar ids únicos de cada seletor na página. */
  private static contador = 0;

  /** Foto atual já salva do usuário (mostrada enquanto não se escolhe outra). */
  readonly urlAtual = input<string | null>(null);

  /** Nome do usuário — para as iniciais quando não há foto. */
  readonly nome = input<string>('');

  /** Diâmetro da prévia em pixels. */
  readonly tamanho = input<number>(96);

  /** Emite o arquivo escolhido, ou nulo quando a escolha é descartada. */
  readonly mudou = output<File | null>();

  /**
   * Id único da entrada de arquivo. Precisa ser único porque pode haver vários
   * seletores na mesma página (ex.: uma linha por usuário na tabela), e o
   * rótulo (<label for>) tem que apontar para o input certo.
   */
  protected readonly idEntrada = `seletor-foto-${++SeletorFoto.contador}`;

  /** Arquivo escolhido no momento (nulo = nenhuma foto nova). */
  protected readonly arquivo = signal<File | null>(null);

  /** URL temporária da prévia da foto nova (ou nula). */
  protected readonly previa = signal<string | null>(null);

  /** Mensagem de erro da validação local (tipo/tamanho). */
  protected readonly erro = signal<string>('');

  constructor() {
    // Garante que a URL temporária da prévia seja liberada ao destruir o
    // componente, evitando vazamento de memória.
    inject(DestroyRef).onDestroy(() => this.liberarPrevia());
  }

  /**
   * Chamado quando o usuário escolhe um arquivo. Valida e, se estiver ok, monta
   * a prévia e avisa o componente-pai pelo evento `mudou`.
   */
  protected aoSelecionar(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const arquivoEscolhido = entrada.files?.[0] ?? null;
    if (!arquivoEscolhido) {
      return;
    }

    const erroValidacao = validarArquivoFoto(arquivoEscolhido);
    if (erroValidacao) {
      this.erro.set(erroValidacao);
      entrada.value = '';
      return;
    }

    this.erro.set('');
    this.liberarPrevia();
    this.arquivo.set(arquivoEscolhido);
    this.previa.set(URL.createObjectURL(arquivoEscolhido));
    this.mudou.emit(arquivoEscolhido);
  }

  /** Descarta a foto escolhida (mantém a foto atual, se houver). */
  protected descartar(): void {
    this.liberarPrevia();
    this.arquivo.set(null);
    this.previa.set(null);
    this.erro.set('');
    this.mudou.emit(null);
  }

  /** Libera da memória a URL temporária usada na prévia. */
  private liberarPrevia(): void {
    const previa = this.previa();
    if (previa) {
      URL.revokeObjectURL(previa);
    }
  }
}
