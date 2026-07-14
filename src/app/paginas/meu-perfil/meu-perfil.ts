import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UsuarioServico } from '../../nucleo/servicos/usuario.servico';
import { SessaoServico } from '../../nucleo/servicos/sessao.servico';
import { Usuario, rotuloDoPerfil } from '../../nucleo/modelos/usuario.modelo';
import { validarArquivoFoto } from '../../nucleo/util/validacao-foto';

/**
 * Tela "Meu perfil": qualquer usuário autenticado edita os próprios dados
 * (nome, telefone e foto de perfil). O perfil em si (cliente, dono...) é apenas
 * exibido — sua alteração continua restrita ao admin, na tela de clientes.
 *
 * Ao salvar, além de atualizar no back-end, os dados da sessão são atualizados
 * para que o nome/foto no topo do painel reflitam a mudança na hora.
 */
@Component({
  selector: 'app-meu-perfil',
  imports: [FormsModule],
  templateUrl: './meu-perfil.html',
  styleUrl: './meu-perfil.scss',
})
export class MeuPerfil {
  private readonly usuarioServico = inject(UsuarioServico);
  private readonly sessao = inject(SessaoServico);

  /** Usuário autenticado atual (fonte dos dados exibidos). */
  protected readonly usuario = this.sessao.usuario;

  /** Campos editáveis do formulário. */
  protected readonly nome = signal(this.usuario()?.nome ?? '');
  protected readonly telefone = signal(this.usuario()?.telefone ?? '');

  /** Foto escolhida (nula quando não trocada) e prévia exibida na tela. */
  protected readonly fotoSelecionada = signal<File | null>(null);
  protected readonly previaFoto = signal<string | null>(null);

  /** Estado de envio e mensagens de feedback. */
  protected readonly salvando = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly mensagemSucesso = signal('');

  /** Rótulo amigável do perfil (só leitura). */
  protected rotuloPerfil(): string {
    const usuario = this.usuario();
    return usuario ? rotuloDoPerfil(usuario.perfil) : '';
  }

  /** Iniciais do nome, exibidas quando não há foto. */
  protected iniciais(): string {
    const partes = (this.usuario()?.nome ?? '').trim().split(/\s+/);
    const primeira = partes[0]?.charAt(0) ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (primeira + ultima).toUpperCase();
  }

  /**
   * Chamado quando o usuário escolhe uma nova foto. Valida tipo e tamanho no
   * navegador (o back-end valida de novo pelo conteúdo) e monta a prévia.
   */
  protected aoSelecionarFoto(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const arquivo = entrada.files?.[0] ?? null;
    if (!arquivo) {
      return;
    }

    const erroValidacao = validarArquivoFoto(arquivo);
    if (erroValidacao) {
      this.mensagemErro.set(erroValidacao);
      entrada.value = '';
      return;
    }

    this.mensagemErro.set('');
    this.liberarPrevia();
    this.fotoSelecionada.set(arquivo);
    this.previaFoto.set(URL.createObjectURL(arquivo));
  }

  /** Remove a foto recém-escolhida (mantém a foto atual, se houver). */
  protected removerFotoSelecionada(): void {
    this.liberarPrevia();
    this.fotoSelecionada.set(null);
    this.previaFoto.set(null);
  }

  /** Salva as alterações: primeiro os dados, depois a foto (se houver). */
  protected salvar(): void {
    const usuarioAtual = this.usuario();
    if (!usuarioAtual) {
      return;
    }
    if (!this.nome().trim()) {
      this.mensagemErro.set('O nome não pode ficar vazio.');
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const telefone = this.telefone().trim();
    this.usuarioServico
      .atualizarMeuPerfil({
        nome: this.nome().trim(),
        telefone: telefone === '' ? null : telefone,
      })
      .subscribe({
        next: (atualizado) => {
          const novaFoto = this.fotoSelecionada();

          // Sem foto nova: conclui já com os dados atualizados.
          if (!novaFoto) {
            this.concluir(atualizado);
            return;
          }

          // Com foto nova: envia o arquivo e usa a resposta (já com o novo
          // url_avatar) como versão final.
          this.usuarioServico.enviarFoto(usuarioAtual.id, novaFoto).subscribe({
            next: (comFoto) => this.concluir(comFoto),
            error: (erro: HttpErrorResponse) => {
              // Os dados foram salvos, só a foto falhou: reflete os dados e
              // avisa sobre a foto.
              this.concluir(atualizado);
              this.mensagemSucesso.set('');
              this.mensagemErro.set(
                erro.error?.erro ??
                  'Dados salvos, mas não foi possível enviar a foto.',
              );
            },
          });
        },
        error: (erro: HttpErrorResponse) => {
          this.salvando.set(false);
          this.mensagemErro.set(
            erro.error?.erro ?? 'Não foi possível salvar o perfil.',
          );
        },
      });
  }

  /** Aplica o usuário atualizado à sessão e mostra o sucesso. */
  private concluir(atualizado: Usuario): void {
    this.sessao.atualizarUsuario(atualizado);
    this.removerFotoSelecionada();
    this.salvando.set(false);
    this.mensagemSucesso.set('Perfil atualizado com sucesso.');
  }

  /** Libera da memória a URL temporária usada na prévia da foto. */
  private liberarPrevia(): void {
    const previa = this.previaFoto();
    if (previa) {
      URL.revokeObjectURL(previa);
    }
  }
}
