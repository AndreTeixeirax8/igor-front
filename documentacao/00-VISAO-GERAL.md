# Front-end (Angular 21) — Visão geral e índice

> **Comece por aqui.** Este arquivo dá o contexto mínimo do front e diz **em qual
> documento está cada assunto**. Leia os demais **sob demanda**: só abra o
> arquivo do assunto que a tarefa realmente envolve.

---

## O que é

Aplicação **Angular 21** do sistema de agendamento **Igor Style's**: o cliente se
cadastra, marca horário e acompanha seus pontos; a barbearia gerencia a agenda e
os cadastros.

- **Porta 4201** (a 4200 já é usada por outro projeto).
- **Standalone components + signals**, sem SSR, SCSS.
- Fala com o back (Go, porta 3001) por **proxy**: `/api` → `localhost:3001`.
- Documentação do back: [`back/documentacao/`](../../back/documentacao/00-VISAO-GERAL.md).

---

## Índice — qual arquivo ler para cada assunto

| Se a tarefa envolve… | Leia |
| -------------------- | ---- |
| **Qualquer alteração de código** (sempre) | [`01-convencoes-e-regras.md`](01-convencoes-e-regras.md) |
| Onde criar arquivo, pastas, rotas, guardas, interceptador | [`02-estrutura-e-arquitetura.md`](02-estrutura-e-arquitetura.md) |
| Criar tela ou componente — **o que já existe pronto** | [`03-componentes-compartilhados.md`](03-componentes-compartilhados.md) |
| Cor, tema escuro/claro, fonte, contraste, responsivo | [`04-identidade-visual.md`](04-identidade-visual.md) |
| Chamar a API, serviços, modelos, proxy, tratamento de erro | [`05-integracao-com-api.md`](05-integracao-com-api.md) |
| Saber o que cada tela faz e quem acessa | [`06-telas.md`](06-telas.md) |
| O que já está pronto e o que falta | [`07-estado-e-pendencias.md`](07-estado-e-pendencias.md) |

---

## Mapa de pastas

```
front/src/app/
├── nucleo/            ← código central, SEM tela (a espinha dorsal)
│   ├── configuracao/  ← endereço base e rotas da API
│   ├── modelos/       ← interfaces que espelham o JSON do back + rótulos
│   ├── servicos/      ← um serviço por recurso da API (+ sessao, tema...)
│   ├── interceptadores/ ← anexa o Bearer no cabeçalho
│   ├── guardas/       ← proteção de rota
│   └── util/          ← funções puras reutilizáveis
├── compartilhado/     ← componentes de UI reutilizáveis
└── paginas/           ← as telas (uma pasta por tela, com lazy loading)
```

**Regra rápida de decisão** — onde colocar o que você vai criar:

| O que é | Onde vai |
| ------- | -------- |
| UI que aparece em mais de uma tela | `compartilhado/` |
| Lógica pura, sem tela | `nucleo/util/` |
| Algo que fala com a API | um serviço em `nucleo/servicos/` + um modelo em `nucleo/modelos/` |
| Uma tela | `paginas/<nome>/` + rota em `app.routes.ts` (lazy) |

---

## Como rodar

Pré-requisitos: **Node 24+** e **Angular CLI 21**.

```bash
cd front && npm install     # só na primeira vez
cd front && npm start       # abre em http://localhost:4201
```

⚠️ **O back precisa estar no ar** na porta 3001 (com o PostgreSQL conectado) —
o front chama a API por proxy. Para testar o login é preciso já existir um
usuário: crie por `POST /api/auth/registrar` ou pela tela de cadastro.

Build de verificação (o que roda antes de terminar qualquer tarefa):

```bash
cd front && npx ng build --configuration development
```

---

## ⚠️ Regra de manutenção desta documentação

**Toda alteração de código deve ser refletida aqui, no mesmo trabalho.**

1. Criei/alterei **tela**? → [`06-telas.md`](06-telas.md) (e a rota em
   [`02`](02-estrutura-e-arquitetura.md) se mudou guarda/caminho).
2. Criei **componente ou util compartilhado**? → [`03`](03-componentes-compartilhados.md).
3. Criei **serviço ou modelo** de API? → [`05`](05-integracao-com-api.md).
4. Mexi em **cor, fonte, tema ou responsividade**? → [`04`](04-identidade-visual.md).
5. Mudei uma **convenção**? → [`01`](01-convencoes-e-regras.md).
6. Terminei algo pendente? → mova em [`07`](07-estado-e-pendencias.md).
7. **Assunto novo que não cabe em nenhum arquivo?** Crie o arquivo **e**
   acrescente a linha no índice acima — senão ninguém vai encontrá-lo.
