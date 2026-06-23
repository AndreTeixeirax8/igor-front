import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import { Usuario } from '../modelos/usuario.modelo';

/**
 * Serviço responsável por buscar dados de usuários na API.
 *
 * Observação: a rota de listagem é protegida no back-end e só responde para
 * administradores. O token JWT é anexado automaticamente pelo interceptador.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioServico {
  private readonly clienteHttp = inject(HttpClient);

  /**
   * Lista todos os usuários cadastrados. Só funciona para administradores;
   * para os demais perfis o back-end devolve 403 (acesso negado).
   *
   * @returns Um Observable com a lista de usuários.
   */
  listarTodos(): Observable<Usuario[]> {
    const enderecoCompleto =
      configuracaoApi.enderecoBase + configuracaoApi.rotasUsuario.listar;

    return this.clienteHttp.get<Usuario[]>(enderecoCompleto);
  }
}
