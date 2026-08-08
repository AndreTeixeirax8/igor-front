# Componentes, utils e classes compartilhadas — USE, não recrie

> **Leia antes de criar tela ou componente.** Este é o inventário do que já está
> pronto. Recriar qualquer coisa daqui é retrabalho — e já aconteceu no projeto.
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).

---

## 1. Componentes (`src/app/compartilhado/`)

| Componente | Para quê | Como usar |
| ---------- | -------- | --------- |
| `app-avatar` | Foto do usuário ou iniciais num círculo | `<app-avatar [nome]="u.nome" [url]="u.url_avatar" [tamanho]="40" />` |
| `app-selo` | Pílula colorida de perfil ou status | `<app-selo [tipo]="u.perfil">{{ rotulo }}</app-selo>` |
| `app-mensagem` | Faixa de feedback de erro/sucesso | `<app-mensagem tipo="erro" [texto]="mensagemErro()" />` |
| `app-seletor-foto` | Enviar/trocar foto, com prévia e validação | `<app-seletor-foto [urlAtual]="u.url_avatar" [nome]="u.nome" (mudou)="foto.set($event)" />` |
| `app-logotipo` | Logo da marca | `<app-logotipo [tamanho]="56" />` |
| `app-cartao-nivel` | Nível, barra de XP e saldo de pontos | `<app-cartao-nivel [progresso]="dadosProgresso" />` |
| `app-layout-painel` | Casca das telas internas (menu lateral + topo) | Usado pelas rotas internas, não diretamente |

O `app-selo` escolhe a cor sozinho a partir do `tipo` (perfil **ou** status) — não
passe cor por fora.

---

## 2. Utils (`src/app/nucleo/util/`)

| Util | Para quê |
| ---- | -------- |
| `mensagemDeErro(erro, padrao?)` | Traduz erro HTTP em texto pt-BR (usa o campo `erro` do back). **Sempre** use no `error:` de um `subscribe` — nunca escreva um "traduzirErro" novo. |
| `calcularIniciais(nome)` | Iniciais de um nome (o `app-avatar` já usa por baixo). |
| `validarArquivoFoto(arquivo)` | Valida PNG/JPG até 5 MB (o `app-seletor-foto` já usa). É só retorno rápido — quem garante de verdade é o back. |
| `paraRFC3339ComFusoLocal`, `formatarDataHora` (`data-hora.ts`) | Datas: converter para o formato que o back espera e formatar para exibição. |

---

## 3. Rótulos de exibição (`nucleo/modelos/`)

Funções que traduzem valor técnico em texto amigável ficam **junto do modelo**,
nunca espalhadas pelas telas:

| Função | Modelo | Exemplo |
| ------ | ------ | ------- |
| `rotuloDoPerfil(perfil)` | `usuario.modelo.ts` | `admin` → "Administrador" |
| `rotuloStatus(status)` | `agendamento.modelo.ts` | `nao_compareceu` → "Não compareceu" |
| `statusEncerrado(status)` | `agendamento.modelo.ts` | diz se o agendamento é final |
| `rotuloTipoMovimentacao(tipo)` | `gamificacao.modelo.ts` | `ganho_servico` → "Atendimento concluído" |

Ao criar um enum novo, **coloque o rótulo junto do modelo**.

---

## 4. Classes globais (`src/styles.scss`)

Não recrie esses estilos em componente:

| Classe | Para quê |
| ------ | -------- |
| `.botao`, `.botao--principal`, `.botao--contorno` | Botões |
| `.campo`, `.campo__rotulo`, `.campo__entrada` | Campos de formulário |
| `.paginacao`, `.paginacao__botao`, `.paginacao__info` | Rodapé de listagem paginada |
| `.auth-simples`, `.auth-simples__cartao`… | Cartão central das telas de senha |

---

## 5. Quando criar algo novo compartilhado

Regra: **apareceu em 2+ telas, vira compartilhado.**

- É UI? → `compartilhado/<nome>/` com `.ts`, `.html` e `.scss`.
- É lógica pura? → `nucleo/util/<nome>.ts`.
- É só estilo repetido? → classe global em `styles.scss` (foi o caso de
  `.paginacao`, que estava presa na tela de clientes).

Depois **acrescente à tabela correspondente deste arquivo** — senão a próxima
pessoa vai recriar.

---

## ⚠️ Ao alterar este assunto

Criou componente, util, rótulo ou classe global? Adicione na tabela certa deste
arquivo. É ele que evita duplicação.
