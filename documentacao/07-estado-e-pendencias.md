# Estado atual e pendências — front

> O que já está pronto e o que falta. **Atualize sempre que concluir ou começar
> algo.**
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).
> Pendências do back: [`back/documentacao/10-estado-e-pendencias.md`](../../back/documentacao/10-estado-e-pendencias.md).

---

## ✅ Pronto

**Base:** sessão por JWT no `localStorage`, logout, interceptador que anexa o
Bearer, guardas por perfil, layout do painel (menu lateral + topo) com o menu
adaptado ao perfil, **tema escuro/claro** lembrado no navegador, identidade
visual aplicada (dourado `#E0CD55`, logo em `public/logo.png`).

**Camada de dados completa:** serviços + modelos cobrindo **todas** as rotas da
API (autenticação, usuários, barbearias, barbeiros, serviços, disponibilidades,
agendamentos e gamificação).

**Telas** (detalhe em [`06-telas.md`](06-telas.md)):

| Tela | Quem acessa |
| ---- | ----------- |
| `login` (com "Lembrar-me" e atalho de senha) | público |
| `cadastro` (com foto opcional) | público |
| `esqueci-senha` / `redefinir-senha` | público |
| `principal` (painel + cartão de nível/XP) | autenticado |
| `agendar` (calendário com horários livres) | autenticado |
| `meus-agendamentos` | autenticado |
| `meu-perfil` (dados, foto e tema) | autenticado |
| `agenda-gestor` (paginada, filtro e status) | gestor |
| `clientes` (busca, paginação, edição; cartões no celular) | admin/dono |
| `gestao` (barbearia, serviços com pontos, barbeiros, grade) | admin/dono |

**Acessibilidade e leitura:** contraste mínimo de 4,5:1 nos dois temas, piso de
14px no texto, Inter variável, números tabulares nas listagens.

---

## ⏳ A fazer

- [ ] **Edição de barbearias e barbeiros** (serviços já têm edição e
      ativar/desativar).
- [ ] **Resolver nomes por lote** — hoje é uma chamada por ID (com cache), o que
      pesa em telas com muitos agendamentos.
- [ ] Aviso de **"você subiu de nível!"** após um atendimento ser concluído
      (dá para detectar comparando o nível antes e depois).
- [ ] Tela de **extrato de pontos** para o cliente — a rota
      `GET /gamificacao/meu-extrato` já existe e o serviço no front também.
- [ ] Carregar dados reais em **todos** os cartões de resumo do painel (alguns
      ainda são fictícios).
- [ ] (Pré-produção) deploy, HTTPS e testes.

---

## ⚠️ Ao alterar este assunto

Concluiu um item? **Mova da lista de pendências para a de pronto.** Começou algo
novo? Acrescente aqui, para não se perder.
