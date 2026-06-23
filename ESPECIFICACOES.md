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
│   ├── servicos/
│   │   ├── sessao.servico.ts        # Guarda token + usuário (localStorage)
│   │   ├── autenticacao.servico.ts  # Login / cadastro / logout (chama a API)
│   │   └── usuario.servico.ts       # Busca usuários (listagem — só admin)
│   ├── interceptadores/
│   │   └── token.interceptador.ts   # Anexa "Authorization: Bearer <token>"
│   └── guardas/
│       ├── autenticacao.guarda.ts   # Protege rotas que exigem login
│       └── admin.guarda.ts          # Protege rotas restritas a administradores
│
├── compartilhado/              # Componentes reutilizáveis de interface
│   ├── logotipo/
│   └── layout-painel/          # Casca das telas internas (barra lateral + topo)
│
├── paginas/                    # As telas do sistema
│   ├── login/                  # Tela de login
│   ├── cadastro/               # Tela de criação de nova conta
│   ├── principal/              # Tela principal (painel) após o login
│   └── clientes/               # Lista de clientes em tabela (somente admin)
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

### Rotas usadas neste protótipo

| Ação           | Método e rota              | Corpo enviado                       | Resposta             |
| -------------- | -------------------------- | ----------------------------------- | -------------------- |
| Login           | `POST /api/auth/login`     | `{ email, senha }`                 | `{ token, usuario }` |
| Cadastro        | `POST /api/auth/registrar` | `{ nome, email, telefone, senha }` | `{ token, usuario }` |
| Perfil próprio  | `GET /api/usuarios/me`     | — (header com token)               | dados do usuário     |
| Listar usuários | `GET /api/usuarios`        | — (header com token)               | lista de usuários    |

> A listagem de usuários é **restrita a administradores** no back-end (responde
> 403 para os demais). No front, além disso, a rota `/clientes` é protegida pela
> `admin.guarda.ts` e o item "Clientes" só aparece no menu para administradores.

> No cadastro o front **não** envia o perfil: o back-end cria todo novo usuário
> como "cliente". Após o cadastro, o usuário é levado de volta à tela de login
> para se autenticar (não aproveitamos o token devolvido no registro).

O token JWT recebido no login é guardado no `localStorage` e enviado
automaticamente em todas as requisições seguintes pelo interceptador.

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
- Tela de cadastro de nova conta (volta ao login com aviso de sucesso).
- Sessão persistente (token no `localStorage`) e logout.
- Proteção de rota: o painel só abre para usuário autenticado; a tela de
  clientes só abre para administradores.
- Layout interno compartilhado (barra lateral + topo) reaproveitado pelas telas.
- Tela principal (painel) com identidade visual aplicada.
- Tela de clientes: tabela com busca, contato e perfil (dados reais do back).

**Ainda a fazer (próximas telas):**

- Módulos de agendamentos e serviços ligados ao back.
- Ações na tela de clientes (ver detalhes, editar, promover a admin via PUT).
- Carregar dados reais nos cartões de resumo (hoje são valores fictícios).
```
