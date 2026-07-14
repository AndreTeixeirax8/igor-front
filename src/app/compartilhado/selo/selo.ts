import { Component, input, computed } from '@angular/core';

/**
 * Mapa de cada "tipo" (perfil de usuário ou status de agendamento) para uma das
 * seis cores de chip definidas no styles.scss. Como os valores de perfil e de
 * status não se repetem, um único mapa atende aos dois casos.
 */
const COR_POR_TIPO: Record<string, string> = {
  // Perfis de usuário.
  cliente: 'neutro',
  barbeiro: 'azul',
  dono: 'roxo',
  admin: 'dourado',
  // Status de agendamento.
  agendado: 'dourado',
  confirmado: 'azul',
  em_andamento: 'roxo',
  concluido: 'verde',
  cancelado: 'vermelho',
  nao_compareceu: 'vermelho',
};

/**
 * Selo colorido (chip) usado para mostrar o perfil de um usuário ou o status de
 * um agendamento. A cor é escolhida automaticamente a partir do `tipo`; o texto
 * exibido vem por projeção de conteúdo (`<app-selo …>Texto</app-selo>`), para a
 * tela continuar usando seus próprios rótulos (rotuloDoPerfil / rotuloStatus).
 *
 * Antes, esse bloco de estilos estava copiado em quatro telas diferentes.
 */
@Component({
  selector: 'app-selo',
  template: `<span class="selo selo--{{ cor() }}"><ng-content /></span>`,
  styleUrl: './selo.scss',
})
export class Selo {
  /** Perfil do usuário ou status do agendamento (ex.: 'admin', 'confirmado'). */
  readonly tipo = input.required<string>();

  /** Cor do chip, derivada do tipo (cai em "neutro" se o tipo for desconhecido). */
  protected readonly cor = computed(() => COR_POR_TIPO[this.tipo()] ?? 'neutro');
}
