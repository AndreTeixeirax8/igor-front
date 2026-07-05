import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, shareReplay } from 'rxjs/operators';

import { UsuarioServico } from './usuario.servico';
import { ServicoServico } from './servico.servico';
import { BarbeiroServico } from './barbeiro.servico';

/**
 * Serviço que resolve nomes amigáveis a partir dos IDs que vêm nos
 * agendamentos (o back devolve só os identificadores). Mantém um cache por ID
 * para não repetir chamadas à API quando o mesmo barbeiro/serviço/cliente
 * aparece em vários agendamentos.
 */
@Injectable({ providedIn: 'root' })
export class ResolvedorNomesServico {
  private readonly usuarioServico = inject(UsuarioServico);
  private readonly servicoServico = inject(ServicoServico);
  private readonly barbeiroServico = inject(BarbeiroServico);

  private readonly cacheUsuario = new Map<number, Observable<string>>();
  private readonly cacheServico = new Map<number, Observable<string>>();
  private readonly cacheBarbeiro = new Map<number, Observable<string>>();

  /** Nome de um usuário (com cache). Em caso de erro, devolve "Usuário #id". */
  nomeDoUsuario(id: number): Observable<string> {
    if (!this.cacheUsuario.has(id)) {
      this.cacheUsuario.set(
        id,
        this.usuarioServico.buscarPorId(id).pipe(
          map((usuario) => usuario.nome),
          catchError(() => of(`Usuário #${id}`)),
          shareReplay(1),
        ),
      );
    }
    return this.cacheUsuario.get(id)!;
  }

  /** Nome de um serviço (com cache). Em caso de erro, devolve "Serviço #id". */
  nomeDoServico(id: number): Observable<string> {
    if (!this.cacheServico.has(id)) {
      this.cacheServico.set(
        id,
        this.servicoServico.buscarPorId(id).pipe(
          map((servico) => servico.nome),
          catchError(() => of(`Serviço #${id}`)),
          shareReplay(1),
        ),
      );
    }
    return this.cacheServico.get(id)!;
  }

  /**
   * Nome de um barbeiro (com cache). Como o barbeiro referencia um usuário,
   * resolve barbeiro → usuário → nome. Em caso de erro, devolve "Barbeiro #id".
   */
  nomeDoBarbeiro(id: number): Observable<string> {
    if (!this.cacheBarbeiro.has(id)) {
      this.cacheBarbeiro.set(
        id,
        this.barbeiroServico.buscarPorId(id).pipe(
          switchMap((barbeiro) => this.nomeDoUsuario(barbeiro.id_usuario)),
          catchError(() => of(`Barbeiro #${id}`)),
          shareReplay(1),
        ),
      );
    }
    return this.cacheBarbeiro.get(id)!;
  }
}
