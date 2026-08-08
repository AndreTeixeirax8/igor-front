import { Component, input } from '@angular/core';

import { ProgressoGamificacao } from '../../nucleo/modelos/gamificacao.modelo';

/**
 * Cartão de nível e XP do cliente: mostra o nível atual, a barra de progresso
 * até o próximo e o saldo de pontos disponível.
 *
 * Recebe o progresso já calculado pelo back-end (o front não conhece a escada de
 * níveis), então é só exibição — dá para reusar em qualquer tela.
 */
@Component({
  selector: 'app-cartao-nivel',
  templateUrl: './cartao-nivel.html',
  styleUrl: './cartao-nivel.scss',
})
export class CartaoNivel {
  /** Progresso do cliente, vindo de GET /gamificacao/meu-progresso. */
  readonly progresso = input.required<ProgressoGamificacao>();
}
