# Identidade visual — cores, temas, tipografia e responsivo

> Leia quando mexer em **cor, tema, fonte, contraste ou layout responsivo**.
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).
> Tudo mora em **`src/styles.scss`**.

---

## 1. Cores

- **Cor principal:** `#E0CD55` (dourado do logo).
- Todas as cores são **variáveis CSS** no topo de `src/styles.scss`. Para
  reajustar a paleta, altere **só ali**.
- **Regra:** componentes usam sempre `var(--...)`, **nunca** cor cravada. É isso
  que faz a troca de tema funcionar na tela inteira.

### ⚠️ A regra do dourado (a mais importante)

| Uso | Variável |
| --- | -------- |
| **Fundo e borda** | `--cor-principal` |
| **Texto** | `--cor-principal-texto` |

O dourado da marca só tem contraste sobre fundo escuro: sobre o fundo claro fica
em **1,5:1**, praticamente ilegível. A `--cor-principal-texto` vira um dourado
escuro (`#7d6c1a`, ~4,8:1) no tema claro.

**`color: var(--cor-principal)` está proibido** e não existe mais no código.

### Contraste mínimo

**4,5:1** entre texto e fundo, **nos dois temas** (WCAG AA). Como auditar: no
console do navegador, ler as variáveis com
`getComputedStyle(document.documentElement)`, alternar `data-tema='claro'` e
calcular a razão de contraste. Foi assim que os problemas foram encontrados.

---

## 2. Temas (escuro/claro)

- **Escuro é o padrão** (estilo de barbearia clássica, destaca o dourado).
- O **`TemaServico`** (`nucleo/servicos/tema.servico.ts`) grava
  `data-tema="claro"` no `<html>`; o bloco `:root[data-tema='claro']` em
  `styles.scss` sobrescreve as variáveis com a paleta clara.
- A escolha é lembrada no `localStorage` e aplicada na abertura, pela injeção do
  serviço no componente raiz (`app.ts`).
- O usuário troca pelo item **🌙/☀️** no menu do usuário (topo) ou pelo cartão
  "Aparência" em **Meu perfil**.

**Para um tema novo:** basta adicionar outro bloco `:root[data-tema='...']` —
nenhum componente precisa mudar.

⚠️ Ao criar uma cor nova, adicione **nos dois blocos** (`:root` e
`[data-tema='claro']`), senão a tela quebra em um dos temas.

---

## 3. Tipografia

- **Poppins** nos títulos, **Inter** no texto — carregadas em `src/index.html`.
- A **Inter é a escolha certa** e não deve ser trocada: foi desenhada para telas,
  com altura de x grande e letras abertas, o que a torna legível em corpo
  pequeno. Está na versão **variável**, com `font-optical-sizing: auto` (a fonte
  engrossa levemente os traços no texto miúdo).
- **Nada de `-webkit-font-smoothing: antialiased`** — ele afina os traços e
  prejudica justamente a leitura do texto pequeno.
- **Piso de tamanho: `0.875rem` (14px).** Escala em uso: 0.875 / 0.9 / 0.95 / 1rem.
- `line-height` do corpo: **1.6**.
- **Números tabulares** (`font-variant-numeric: tabular-nums`) em tabelas,
  paginação e datas da agenda — horários e preços alinham em coluna e não
  "dançam" ao atualizar.

---

## 4. Responsivo

### Tabela vira cartão no celular

Abaixo de **768px**, `<tr>` vira um cartão empilhado e cada `<td>` vira
"rótulo: valor". O rótulo sai do atributo **`data-rotulo`** do próprio `<td>` —
**não duplique marcação** só para o mobile. Exemplo pronto:
`paginas/clientes/clientes.scss`.

**Por que isso existe:** uma tabela de 5 colunas precisa de ~686px. Num celular
de 375px ela transbordava 345px e o `overflow: hidden` do cartão **cortava a
coluna de ações** — o botão "Editar" ficava inalcançável, sem nem poder rolar.

⚠️ **Não** resolva tabela larga escondendo colunas (`display: none`): os dados
somem e o que transborda continua cortado.

### Toque

Botões de ação no mobile têm **`min-height: 44px`** — o alvo mínimo recomendado
para dedos.

---

## 5. Logotipo

Componente `app-logotipo`, que exibe a imagem oficial de **`public/logo.png`**.
Se o arquivo não existir, mostra um substituto textual para a tela não quebrar.
Para trocar o logo, basta substituir o arquivo.

---

## ⚠️ Ao alterar este assunto

Criou variável de cor? Adicione **nos dois temas**. Mudou escala tipográfica,
regra de contraste ou padrão responsivo? Atualize este arquivo **e** a tabela de
"o que NÃO fazer" em [`01-convencoes-e-regras.md`](01-convencoes-e-regras.md).
