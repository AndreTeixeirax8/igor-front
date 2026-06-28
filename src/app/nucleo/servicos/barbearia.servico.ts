import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { configuracaoApi } from '../configuracao/configuracao-api';
import { Barbearia, DadosCriacaoBarbearia } from '../modelos/barbearia.modelo';

/**
 * Serviço que conversa com as rotas de barbearias do back-end.
 * A leitura é liberada a qualquer usuário autenticado; criar exige dono ou admin.
 */
@Injectable({ providedIn: 'root' })
export class BarbeariaServico {
  private readonly clienteHttp = inject(HttpClient);
  private readonly endereco =
    configuracaoApi.enderecoBase + configuracaoApi.rotaBarbearias;

  /** Lista todas as barbearias. */
  listar(): Observable<Barbearia[]> {
    return this.clienteHttp.get<Barbearia[]>(this.endereco);
  }

  /** Busca uma barbearia pelo ID. */
  buscarPorId(id: number): Observable<Barbearia> {
    return this.clienteHttp.get<Barbearia>(`${this.endereco}/${id}`);
  }

  /** Cria uma nova barbearia (dono ou admin). */
  criar(dados: DadosCriacaoBarbearia): Observable<Barbearia> {
    return this.clienteHttp.post<Barbearia>(this.endereco, dados);
  }
}
