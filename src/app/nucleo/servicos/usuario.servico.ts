import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { configuracaoApi } from '../configuracao/configuracao-api';
import {
  Usuario,
  DadosAtualizacaoUsuario,
  PaginaUsuarios,
} from '../modelos/usuario.modelo';

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
   * Lista uma página de usuários (GET /usuarios). Permitido a admin e dono.
   *
   * @param pagina  Número da página (começa em 1).
   * @param tamanho Quantidade de itens por página.
   * @param busca   Filtro opcional por nome, e-mail ou telefone.
   */
  listarPagina(pagina: number, tamanho: number, busca = ''): Observable<PaginaUsuarios> {
    const parametros =
      `?pagina=${pagina}&tamanho=${tamanho}` +
      (busca.trim() !== '' ? `&busca=${encodeURIComponent(busca.trim())}` : '');

    return this.clienteHttp.get<PaginaUsuarios>(
      configuracaoApi.enderecoBase + configuracaoApi.rotasUsuario.listar + parametros,
    );
  }

  /**
   * Traz uma lista de usuários para seletores (ex.: vincular um barbeiro).
   * Busca uma página grande e devolve apenas os itens.
   */
  listarTodos(): Observable<Usuario[]> {
    return this.listarPagina(1, 100).pipe(map((pagina) => pagina.itens));
  }

  /**
   * Busca um usuário pelo ID. Disponível para qualquer usuário autenticado.
   * Usado, por exemplo, para mostrar o nome de um barbeiro (que referencia um
   * usuário) na tela de agendamento.
   */
  buscarPorId(id: number): Observable<Usuario> {
    const enderecoCompleto =
      configuracaoApi.enderecoBase + configuracaoApi.rotasUsuario.listar + '/' + id;

    return this.clienteHttp.get<Usuario>(enderecoCompleto);
  }

  /**
   * Edita um usuário (PUT /usuarios/{id}). Permitido a administradores e donos;
   * o back-end aplica as regras de quem pode editar quem.
   */
  atualizar(id: number, dados: DadosAtualizacaoUsuario): Observable<Usuario> {
    const enderecoCompleto =
      configuracaoApi.enderecoBase + configuracaoApi.rotasUsuario.listar + '/' + id;

    return this.clienteHttp.put<Usuario>(enderecoCompleto, dados);
  }
}
