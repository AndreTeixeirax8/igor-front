# Convenções e regras do front

> **Leia sempre.** Vale para qualquer alteração de código no front.
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).
> As regras que valem para o projeto inteiro estão no [`CLAUDE.md`](../../CLAUDE.md).

---

## 1. Código

- **Português, sem abreviações**, em tudo: componentes, métodos, signals, pastas
  e arquivos (`autenticacao`, não `auth`; `requisicao`, não `req`).
- **Nome de arquivo:** `nome.tipo.ts` em kebab-case
  (ex.: `autenticacao.servico.ts`, `token.interceptador.ts`, `seletor-foto.ts`).
- **Comentários** explicando o **porquê** nas funções e trechos não óbvios.
- **Signals** para estado (`signal`, `computed`); entradas e saídas de componente
  com `input()` / `output()`.
- **SCSS** com classes em português no padrão BEM
  (`bloco__elemento--modificador`).
- **Campos que vêm/vão para a API mantêm o nome do JSON do back** (snake_case em
  português: `url_avatar`, `criado_em`). Não "traduza" para camelCase.

---

## 2. Reúso — a lição que já custou retrabalho

**Antes de escrever qualquer coisa, confira se já existe.** A lista completa do
que está pronto está em
[`03-componentes-compartilhados.md`](03-componentes-compartilhados.md).

- Trecho que aparece em 2+ telas vira **componente compartilhado** ou **util**.
- **Nunca** chame `HttpClient` direto de dentro de uma tela — sempre por um
  serviço de `nucleo/servicos/`.
- **Nunca** escreva um "traduzirErro" próprio — use `mensagemDeErro()`.

---

## 3. Checklist antes de criar uma tela nova

1. **Rota:** em `app.routes.ts`, com `loadComponent` (lazy) e a guarda certa
   (`autenticacaoGuarda`, `gestaoGuarda`, `gestorGuarda`).
2. **Dados:** já existe serviço/modelo do recurso? Se não, criar **um** serviço
   em `nucleo/servicos` e **um** modelo em `nucleo/modelos`.
3. **UI:** usar os componentes prontos (`app-avatar`, `app-selo`, `app-mensagem`,
   `app-seletor-foto`, `app-cartao-nivel`) e as classes globais `.botao`,
   `.botao--principal`, `.botao--contorno`, `.campo`, `.campo__entrada`,
   `.paginacao`. **Não** recriar esses estilos.
4. **Erros:** no `error:` do `subscribe`, usar `mensagemDeErro(erro, '...')` e
   exibir com `<app-mensagem>`.
5. **Cores:** só `var(--...)`; dourado em texto é `--cor-principal-texto`.
   Conferir no **tema claro** — é onde o contraste falha.
6. **Responsivo:** conferir no celular (375px). Tabela vira cartão abaixo de
   768px — ver [`04-identidade-visual.md`](04-identidade-visual.md).
7. **Build:** `npx ng build --configuration development` sem erros.
8. **Documentar:** atualizar os arquivos desta pasta (ver a regra no
   [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md)).

---

## 4. O que NÃO fazer (erros que já aconteceram aqui)

| ❌ Não faça | ✅ Faça |
| ---------- | ------ |
| Copiar/colar bloco de selo, feedback, avatar ou upload de foto | Usar o componente compartilhado |
| Cor cravada (`#e9b4a8`, `rgba(...)`) num `.scss` de componente | `var(--...)`; criar a variável no `styles.scss` se faltar |
| `color: var(--cor-principal)` — o dourado some no tema claro (1,5:1) | `color: var(--cor-principal-texto)` |
| `font-size` abaixo de `0.875rem` (14px) | Mínimo `0.875rem`; secundário em `0.9rem` |
| Resolver tabela larga no celular escondendo colunas (`display: none`) | Transformar as linhas em cartões empilhados |
| Um `traduzirErro` privado em cada tela | `mensagemDeErro()` do `nucleo/util` |
| Chamar `HttpClient` direto na tela | Passar por um serviço de `nucleo/servicos` |
| Filtrar/paginar lista grande no front | Pedir filtrado e paginado ao back (senão a paginação fica errada) |
| Nomes ou comentários em inglês/abreviados | Português por extenso |

---

## ⚠️ Ao alterar este assunto

Mudou uma convenção do front? Atualize este arquivo. Se a regra vale para o
projeto todo (back incluído), reflita também no [`CLAUDE.md`](../../CLAUDE.md).
