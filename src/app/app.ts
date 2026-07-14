import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TemaServico } from './nucleo/servicos/tema.servico';

/**
 * Componente raiz da aplicação. Exibe a página da rota atual através do
 * <router-outlet> e garante que o serviço de tema seja criado logo no início,
 * aplicando o tema (escuro/claro) salvo pelo usuário antes das telas surgirem.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Injetar aqui já instancia o serviço (que aplica o tema no construtor).
  private readonly temaServico = inject(TemaServico);
}
