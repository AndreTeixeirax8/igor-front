# Estrutura e arquitetura do front

> Leia quando precisar saber **onde criar um arquivo**, ou mexer em **rotas,
> guardas, interceptador ou configuração da aplicação**.
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).

---

## 1. As três camadas

| Pasta | O que vai | O que **não** vai |
| ----- | --------- | ----------------- |
| `nucleo/` | Código central **sem tela**: serviços, modelos, guardas, interceptadores, utils, configuração | Nada de HTML/SCSS |
| `compartilhado/` | Componentes de UI usados por **mais de uma** tela | Regra de negócio ou chamada de API |
| `paginas/` | As telas, uma pasta por tela, com **lazy loading** | `HttpClient` direto; lógica que caberia num util |

---

## 2. `nucleo/` em detalhe

```
nucleo/
├── configuracao/
│   └── configuracao-api.ts       ← endereço base (/api) e todas as rotas
├── modelos/                      ← interfaces que espelham o JSON do back
│   ├── usuario.modelo.ts             (+ rotuloDoPerfil)
│   ├── autenticacao.modelo.ts
│   ├── agendamento.modelo.ts         (+ rotuloStatus, statusEncerrado)
│   ├── barbearia / barbeiro / servico / disponibilidade.modelo.ts
│   └── gamificacao.modelo.ts         (+ rotuloTipoMovimentacao)
├── servicos/                     ← um por recurso da API
│   ├── sessao.servico.ts             guarda token + usuário (localStorage)
│   ├── autenticacao.servico.ts       login, cadastro, esqueci/redefinir senha
│   ├── usuario.servico.ts            listagem paginada, edição, foto
│   ├── barbearia / barbeiro / servico / disponibilidade.servico.ts
│   ├── agendamento.servico.ts        criar, listar, horários livres, status
│   ├── gamificacao.servico.ts        progresso, extrato, níveis
│   ├── tema.servico.ts               tema escuro/claro (data-tema no <html>)
│   ├── credenciais-lembradas.servico.ts  "Lembrar-me"
│   └── resolvedor-nomes.servico.ts   resolve IDs → nomes (com cache)
├── util/
│   ├── data-hora.ts                  RFC 3339 com fuso local + formatação
│   ├── mensagem-erro.ts              mensagemDeErro(erro) → texto pt-BR
│   ├── iniciais.ts                   calcularIniciais(nome)
│   └── validacao-foto.ts             valida PNG/JPG até 5 MB
├── interceptadores/
│   └── token.interceptador.ts        anexa "Authorization: Bearer <token>"
└── guardas/
    ├── autenticacao.guarda.ts        exige login
    ├── gestao.guarda.ts              exige admin ou dono
    └── gestor.guarda.ts              exige admin, dono ou barbeiro
```

---

## 3. Rotas (`app.routes.ts`)

Toda tela é carregada com **lazy loading** (`loadComponent`).

**Rotas públicas** (fora do layout do painel): `/login`, `/cadastro`,
`/esqueci-senha`, `/redefinir-senha`.

**Rotas internas** ficam dentro do `LayoutPainel`, protegidas por
`autenticacaoGuarda`, e cada uma pode ter uma guarda adicional:

| Caminho | Guarda extra | Quem acessa |
| ------- | ------------ | ----------- |
| `/principal` | — | qualquer autenticado |
| `/agendar` | — | qualquer autenticado |
| `/meus-agendamentos` | — | qualquer autenticado |
| `/meu-perfil` | — | qualquer autenticado |
| `/agenda` | `gestorGuarda` | admin, dono ou barbeiro |
| `/clientes` | `gestaoGuarda` | admin ou dono |
| `/gestao` | `gestaoGuarda` | admin ou dono |

`''` redireciona para `/principal`; `'**'` volta para a raiz.

⚠️ A guarda é só **conveniência de navegação** — quem realmente protege os dados
é o back. Nunca confie na guarda como segurança.

---

## 4. Sessão e autenticação

- O **`SessaoServico`** guarda token e usuário no `localStorage` e expõe o
  usuário como signal (`sessao.usuario()`).
- O **`token.interceptador.ts`** anexa `Authorization: Bearer <token>` em toda
  requisição — as telas e serviços não precisam se preocupar com isso.
- **"Lembrar-me"**: `credenciais-lembradas.servico.ts` guarda e-mail e senha no
  navegador para pré-preencher o login. ⚠️ A senha fica em **texto puro** — é
  aceitável só em dispositivo de uso pessoal.

---

## 5. Configuração da aplicação

- `app.ts` / `app.html` — componente raiz, só o `<router-outlet>`. É onde o
  `TemaServico` é injetado, aplicando o tema salvo logo na abertura.
- `app.config.ts` — providers: roteador, `HttpClient` e o interceptador.
- `proxy.conf.json` — encaminha `/api` para `http://localhost:3001`.

---

## ⚠️ Ao alterar este assunto

Criou uma **rota**, **guarda**, **serviço** ou **util**? Atualize a árvore da
seção 2 e/ou a tabela de rotas da seção 3. Tela nova também entra em
[`06-telas.md`](06-telas.md).
