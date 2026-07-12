# Front-end — Igor Style's Barbearia

Front-end em **Angular 21** (standalone components + signals) para o sistema de
agendamento da barbearia **Igor Style's**. Conversa com o back-end em Go
(pasta `../back`).

Este documento descreve as convenções do projeto e como rodar. Ele segue a mesma
"pegada" do back-end: **tudo em português, sem abreviações e com comentários**.

---

## 1. Convenções de código

Estas regras valem para todo o código do front e espelham as do back-end:

- **Idioma:** nomes de componentes, serviços, funções, variáveis, pastas e
  arquivos em **português**.
- **Sem abreviações** que dificultem o entendimento (ex.: usar `autenticacao`,
  não `auth`; `requisicao`, não `req`).
- **Comentários explicativos** em todas as funções e blocos não óbvios,
  descrevendo a intenção (o "porquê"), não apenas o "o quê".
- **Nomenclatura de arquivos:** `nome.tipo.ts` em kebab-case
  (ex.: `autenticacao.servico.ts`, `token.interceptador.ts`).
- **Estilo:** SCSS com variáveis de cor centralizadas em `src/styles.scss`.
  Classes em português no padrão BEM (`bloco__elemento--modificador`).
- **Campos que vêm/vão para a API** mantêm o nome do JSON do back-end
  (snake_case em português, ex.: `url_avatar`, `criado_em`).

---

## 2. Identidade visual

- **Cor principal:** `#E0CD55` (dourado do logo da empresa).
- **Tema:** escuro, no estilo de barbearias clássicas, para dar destaque ao
  dourado e ficar elegante na apresentação ao cliente.
- As cores estão todas em variáveis CSS no topo de `src/styles.scss`
  (`--cor-principal`, `--cor-fundo`, etc.). Para reajustar a paleta, altere
  apenas ali.
- **Fontes:** Poppins (títulos) e Inter (texto), carregadas em `src/index.html`.
- **Logotipo:** componente `app-logotipo`
  (`src/app/compartilhado/logotipo/`). Ele exibe a imagem oficial salva em
  **`public/logo.png`** (o círculo dourado com o nome "Igor Style's"). Se o
  arquivo não existir, mostra um substituto textual para a tela não quebrar.
  Para trocar o logo no futuro, basta substituir o arquivo `public/logo.png`.

---

## 3. Estrutura de pastas

```
src/app/
├── nucleo/                      # Código central, sem tela (a "espinha dorsal")
│   ├── configuracao/
│   │   └── configuracao-api.ts  # Endereço base e rotas da API
│   ├── modelos/                 # Interfaces (tipos) que refletem o JSON do back
│   │   ├── usuario.modelo.ts
│   │   └── autenticacao.modelo.ts
│   ├── servicos/               # Um serviço por recurso da API
│   │   ├── sessao.servico.ts        # Guarda token + usuário (localStorage)
│   │   ├── autenticacao.servico.ts  # Login / cadastro / logout
│   │   ├── usuario.servico.ts       # Lista (admin) e busca usuários
│   │   ├── barbearia.servico.ts     # Barbearias
│   │   ├── barbeiro.servico.ts      # Barbeiros
│   │   ├── servico.servico.ts       # Serviços (corte, barba...)
│   │   ├── disponibilidade.servico.ts # Grade de horários
│   │   ├── agendamento.servico.ts   # Agendamentos
│   │   └── resolvedor-nomes.servico.ts # Resolve IDs → nomes (com cache)
│   ├── modelos/                # Interfaces que espelham o JSON do back
│   ├── util/
│   │   └── data-hora.ts             # RFC 3339 com fuso local + formatação
│   ├── interceptadores/
│   │   └── token.interceptador.ts   # Anexa "Authorization: Bearer <token>"
│   └── guardas/
│       ├── autenticacao.guarda.ts   # Exige login
│       ├── admin.guarda.ts          # Exige admin
│       ├── gestao.guarda.ts         # Exige admin ou dono
│       └── gestor.guarda.ts         # Exige admin, dono ou barbeiro
│
├── compartilhado/              # Componentes reutilizáveis de interface
│   ├── logotipo/
│   └── layout-painel/          # Casca das telas internas (barra lateral + topo)
│
├── paginas/                    # As telas do sistema
│   ├── login/                  # Tela de login
│   ├── cadastro/               # Criação de nova conta
│   ├── principal/              # Painel após o login
│   ├── agendar/                # Cliente marca horário (barbearia→barbeiro→serviço→hora)
│   ├── meus-agendamentos/      # Cliente vê e cancela seus agendamentos
│   ├── agenda-gestor/          # Agenda: todos os agendamentos + status (gestor)
│   ├── clientes/               # Lista de clientes (somente admin)
│   └── gestao/                 # Cadastro de barbearia/serviço/barbeiro/grade (admin/dono)
│
├── app.ts / app.html           # Componente raiz (só o <router-outlet>)
├── app.config.ts               # Providers: roteador + HttpClient + interceptador
└── app.routes.ts               # Mapa de rotas (com lazy loading)
```

---

## 4. Integração com o back-end

- O back-end roda em **`http://localhost:3001`** com prefixo **`/api`**.
- O back **não** tem CORS configurado. Para evitar mexer no back, o servidor de
  desenvolvimento do Angular usa um **proxy** (`proxy.conf.json`): toda chamada
  para `/api/...` é encaminhada para `http://localhost:3001/api/...`.
- Por isso, no front, o endereço base é simplesmente `/api`
  (ver `nucleo/configuracao/configuracao-api.ts`).

### Rotas consumidas pelo front

Cada recurso tem um serviço Angular em `nucleo/servicos/`. Os **contratos
completos** (corpo, respostas, permissões) estão em
`../back/ESPECIFICACOES-API.md` — aqui vai só o mapa do que o front usa:

| Recurso          | Serviço Angular              | Rotas consumidas                                                            |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------- |
| Autenticação     | `autenticacao.servico.ts`    | `POST /auth/login`, `POST /auth/registrar`                                  |
| Usuários         | `usuario.servico.ts`         | `GET /usuarios` (admin), `GET /usuarios/{id}`                               |
| Barbearias       | `barbearia.servico.ts`       | `GET /barbearias`, `GET/POST/{id}`                                          |
| Barbeiros        | `barbeiro.servico.ts`        | `GET /barbeiros?id_barbearia=`, `GET/{id}`, `POST`                          |
| Serviços         | `servico.servico.ts`         | `GET /servicos?id_barbearia=`, `GET/{id}`, `POST`, `PUT /{id}` (editar)     |
| Disponibilidades | `disponibilidade.servico.ts` | `GET /disponibilidades?id_barbeiro=`, `POST`, `DELETE /{id}`                |
| Agendamentos     | `agendamento.servico.ts`     | `POST`, `GET /meus`, `GET /horarios-disponiveis`, `GET` (gestor), `PATCH /{id}/cancelar`, `PATCH /{id}/status` |

> Permissões (resumo): leitura para qualquer autenticado; gestão de
> barbearia/barbeiro/serviço/grade para **admin ou dono**; agenda e mudança de
> status para **gestor** (admin/dono/barbeiro). As rotas são protegidas no back
> e, no front, por guardas (`admin.guarda`, `gestao.guarda`, `gestor.guarda`).

> No cadastro o front **não** envia o perfil (o back cria como "cliente") e
> devolve o usuário ao login para se autenticar. O token JWT do login é guardado
> no `localStorage` e anexado automaticamente pelo interceptador.

---

## 5. Como rodar

Pré-requisitos: **Node 24+** e **Angular CLI 21** (já instalados nesta máquina).

1. **Suba o back-end** (na pasta `../back`): o servidor Go precisa estar no ar na
   porta 3001 e o PostgreSQL conectado.

2. **Instale as dependências do front** (só na primeira vez):

   ```bash
   cd front
   npm install
   ```

3. **Rode o servidor de desenvolvimento:**

   ```bash
   npm start
   ```

   Acesse <http://localhost:4201>. A aplicação abre na tela de login; após
   autenticar, vai para o painel principal.

   > A porta foi fixada em **4201** (em `angular.json` e no script `start`),
   > porque a 4200 já é usada por outro projeto.

> Dica: para testar o login é preciso já existir um usuário no banco. Crie um
> pela rota de registro do back (`POST /api/auth/registrar`) ou diretamente no
> banco.

---

## 6. Estado atual e próximos passos

**Pronto (protótipo para apresentação):**

- Tela de login conectada ao back (com tratamento de erros).
- Opção "Lembrar-me": guarda e-mail e senha no navegador (`localStorage`) e
  pré-preenche o login no próximo acesso. Atenção: a senha fica em texto puro,
  então é indicado apenas para dispositivos de uso pessoal.
- Tela de cadastro de nova conta (volta ao login com aviso de sucesso).
- Sessão persistente (token no `localStorage`) e logout.
- Proteção de rota: o painel só abre para usuário autenticado; a tela de
  clientes só abre para administradores.
- Layout interno compartilhado (barra lateral + topo) reaproveitado pelas telas.
  O menu mostra itens conforme o perfil (Gestão para admin/dono; Clientes só admin).
- Tela principal (painel) com identidade visual aplicada.
- Tela de clientes: tabela com busca, contato e perfil (dados reais do back).
- **Agendar** (cliente): escolhe barbearia → barbeiro → serviço e então um
  **calendário do mês** mostra os dias com vaga; ao clicar no dia aparecem os
  **horários livres** (calculados no back via `GET
  /agendamentos/horarios-disponiveis`). O cliente clica no horário e confirma —
  horários ocupados não aparecem, e um `409` (corrida) é tratado com aviso e
  recarga da lista.
- **Meus agendamentos** (cliente): lista e cancela os próprios agendamentos,
  mostrando os **nomes** de serviço e barbeiro.
- **Agenda** (gestor: admin/dono/barbeiro): lista todos os agendamentos com
  filtro por status e permite **mudar o status** (confirmar, iniciar, concluir,
  não compareceu, cancelar); nomes resolvidos a partir dos IDs.
- **Gestão** (admin/dono): cadastra barbearia e, dentro dela, serviços
  (com **edição** de nome/duração/preço e **ativar/desativar**), barbeiros e a
  grade de horários de cada barbeiro.
- **Painel** com dados reais adaptados ao perfil (o cliente vê os próprios
  números; o gestor vê também os da barbearia) e atalhos rápidos.
- Camada de dados (serviços + modelos) cobrindo **todas** as rotas da API.

**Ainda a fazer (próximas telas):**

- Edição de barbearias e barbeiros (serviços já têm edição/ativar-desativar).
- Resolver nomes por lote (hoje uma chamada por ID, com cache).
- Carregar dados reais nos cartões de resumo (hoje são valores fictícios).
```
