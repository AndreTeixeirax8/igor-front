# Arquitetura do front — guia de reúso e organização

> **Para IAs e devs:** este é o guia de **como escrever código no front** deste
> projeto. O objetivo é **reaproveitar, manter simples e organizado**. Leia
> antes de criar uma tela, um componente ou de copiar qualquer trecho. As regras
> gerais (português, sem abreviações, comentários, não commitar) estão no
> [`../CLAUDE.md`](../CLAUDE.md).

Stack: **Angular 21**, standalone components + signals, sem SSR, SCSS. Fala com
o back (Go, porta 3001) por **proxy** (`/api` → `localhost:3001`).

---

## 1. Estrutura de pastas (o que vai onde)

```
src/app/
├── nucleo/            # Código central, SEM tela (a espinha dorsal)
│   ├── configuracao/  # Endereço base e rotas da API
│   ├── modelos/       # Interfaces que espelham o JSON do back + rótulos
│   ├── servicos/      # Um serviço por recurso da API (+ sessao, tema...)
│   ├── interceptadores/  # Ex.: anexa o Bearer no cabeçalho
│   ├── guardas/       # Proteção de rota (autenticacao, gestao, gestor)
│   └── util/          # Funções puras reutilizáveis (sem estado/tela)
├── compartilhado/     # Componentes de UI reutilizáveis (ver seção 3)
└── paginas/           # As telas (uma pasta por tela, com lazy loading)
```

Regra rápida de decisão:

- É **UI reutilizável** (aparece em mais de uma tela)? → `compartilhado/`.
- É **lógica pura** reutilizável (sem tela)? → `nucleo/util/`.
- Fala com a **API**? → um serviço em `nucleo/servicos/` + um modelo em
  `nucleo/modelos/`.
- É **uma tela**? → `paginas/<nome>/` e registre a rota em `app.routes.ts`
  (com `loadComponent`, lazy).

---

## 2. Convenções obrigatórias

- **Português, sem abreviações**, em tudo (componentes, métodos, signals,
  arquivos). Arquivo: `nome.tipo.ts` em kebab-case
  (ex.: `mensagem-erro.ts`, `seletor-foto.ts`).
- **Comentários** explicando o "porquê" nas funções e trechos não óbvios.
- **Signals** para estado (`signal`, `computed`); entradas/saídas de componente
  com `input()` / `output()`.
- **Cor é sempre `var(--...)`** de `src/styles.scss`. Nunca hex/rgba cravado num
  componente — quebra o tema escuro/claro. Se precisar de uma cor nova,
  adicione uma variável no `:root` (e no bloco `[data-tema='claro']`).
- Campos que vêm/vão para a API mantêm o nome do JSON do back (snake_case em
  português, ex.: `url_avatar`, `criado_em`).

---

## 3. Componentes e utils compartilhados — USE, não recrie

Antes de escrever qualquer coisa nova, confira se já existe:

### Componentes (`compartilhado/`)

| Componente          | Para quê | Uso |
| ------------------- | -------- | --- |
| `app-avatar`        | Foto do usuário ou iniciais num círculo | `<app-avatar [nome]="u.nome" [url]="u.url_avatar" [tamanho]="40" />` |
| `app-selo`          | Pílula colorida de perfil ou status | `<app-selo [tipo]="u.perfil">{{ rotulo }}</app-selo>` |
| `app-mensagem`      | Faixa de feedback erro/sucesso | `<app-mensagem tipo="erro" [texto]="mensagemErro()" />` |
| `app-seletor-foto`  | Enviar/trocar foto (prévia + validação) | `<app-seletor-foto [urlAtual]="u.url_avatar" [nome]="u.nome" (mudou)="foto.set($event)" />` |
| `app-logotipo`      | Logo da marca | `<app-logotipo [tamanho]="56" />` |
| `app-layout-painel` | Casca das telas internas (menu + topo) | Usado pelas rotas internas |

### Utils (`nucleo/util/`)

| Util | Para quê |
| ---- | -------- |
| `mensagemDeErro(erro, padrao?)` | Traduz erro HTTP em texto pt-BR (usa o campo `erro` do back). **Sempre** use isto no `error:` de um `subscribe`, nunca escreva um "traduzirErro" novo. |
| `calcularIniciais(nome)` | Iniciais de um nome (o `app-avatar` já usa por baixo). |
| `validarArquivoFoto(arquivo)` | Valida PNG/JPG até 5 MB (o `app-seletor-foto` já usa). |
| `paraRFC3339ComFusoLocal`, `formatarDataHora` (`data-hora.ts`) | Datas. |

### Rótulos de exibição (`nucleo/modelos/`)

Funções como `rotuloDoPerfil(perfil)` e `rotuloStatus(status)` traduzem valores
técnicos para texto amigável. Ao adicionar um novo enum, coloque o rótulo junto
do modelo, não espalhado nas telas.

---

## 4. Checklist antes de criar uma tela nova

1. **Rota:** adicionar em `app.routes.ts` com `loadComponent` (lazy) e a guarda
   certa (`autenticacaoGuarda`, `gestaoGuarda`, `gestorGuarda`).
2. **Dados:** já existe serviço/modelo para o recurso? Se não, criar **um**
   serviço em `nucleo/servicos` e **um** modelo em `nucleo/modelos`. Não chamar
   `HttpClient` direto de dentro da tela.
3. **UI:** usar `app-avatar`, `app-selo`, `app-mensagem`, `app-seletor-foto`,
   botões `.botao`/`.botao--principal`/`.botao--contorno` e campos `.campo`/
   `.campo__entrada` (globais em `styles.scss`). **Não** recriar esses estilos.
4. **Erros:** no `error:` do `subscribe`, usar `mensagemDeErro(erro, '...')` e
   exibir com `<app-mensagem>`.
5. **Cores:** só `var(--...)`. Conferir que a tela fica legível no tema claro.
6. **Idioma/comentários:** português, sem abreviações, comentado.
7. **Build:** `npx ng build --configuration development` sem erros.
8. **Doc:** atualizar `ESPECIFICACOES.md` (e este guia, se criar um componente
   compartilhado novo — adicione-o à tabela da seção 3).

---

## 5. O que NÃO fazer (erros comuns)

- ❌ Copiar/colar bloco de selo, feedback, avatar ou upload de foto numa tela.
  ✅ Usar o componente compartilhado correspondente.
- ❌ Cor cravada (`#e9b4a8`, `rgba(...)`) num `.scss` de componente.
  ✅ `var(--...)`; criar a variável no `styles.scss` se faltar.
- ❌ Um `traduzirErro` privado novo em cada tela.
  ✅ `mensagemDeErro()` do `nucleo/util`.
- ❌ Nomes/So comentários em inglês ou abreviados.
  ✅ Português por extenso.
- ❌ Chamar `HttpClient` direto na tela.
  ✅ Passar por um serviço de `nucleo/servicos`.
