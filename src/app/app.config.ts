import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { tokenInterceptador } from './nucleo/interceptadores/token.interceptador';

/**
 * Configuração raiz da aplicação Angular. Aqui registramos:
 *  - o roteador (com as rotas definidas em app.routes.ts);
 *  - o cliente HTTP, já com o interceptador que anexa o token JWT em cada
 *    requisição à API do back-end.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptador])),
  ],
};
