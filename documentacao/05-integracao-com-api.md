# Integração com o back-end

> Leia quando for **chamar a API**, criar serviço/modelo ou tratar erro de
> requisição.
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).
> Contratos completos (corpo, respostas, permissões):
> [`back/documentacao/`](../../back/documentacao/00-VISAO-GERAL.md).

---

## 1. Como o front alcança o back

- O back roda em **`http://localhost:3001`** com prefixo **`/api`**.
- Em desenvolvimento, o servidor do Angular usa um **proxy**
  (`proxy.conf.json`): tudo que começa com `/api` é encaminhado para o back.
  Como a origem passa a ser a mesma, **o CORS nem entra em ação** localmente.
- Por isso o endereço base no front é simplesmente **`/api`**
  (`nucleo/configuracao/configuracao-api.ts`).

⚠️ **Em produção** (front e back em domínios diferentes) o CORS **é** necessário
— o back libera as origens por `CORS_ORIGENS_PERMITIDAS`. Ver
[`back/documentacao/09-infraestrutura.md`](../../back/documentacao/09-infraestrutura.md).

---

## 2. Regras de ouro

1. **Nunca** chame `HttpClient` direto de uma tela — sempre por um serviço de
   `nucleo/servicos/`.
2. **Um serviço + um modelo por recurso** da API.
3. **Todas as rotas ficam em `configuracao-api.ts`**, não espalhadas em strings.
4. O token é anexado automaticamente pelo **interceptador** — não monte o
   cabeçalho `Authorization` na mão. (Exceção real: o envio da foto logo após o
   cadastro, quando ainda não há sessão; aí o token vai explícito.)
5. **Filtro e paginação são responsabilidade do back.** Filtrar no front uma
   lista paginada dá resultado errado — você estaria filtrando só a página atual.

---

## 3. Serviços por recurso

| Recurso | Serviço | Rotas consumidas |
| ------- | ------- | ---------------- |
| Autenticação | `autenticacao.servico.ts` | `POST /auth/login`, `/auth/registrar`, `/auth/esqueci-senha`, `/auth/redefinir-senha` |
| Usuários | `usuario.servico.ts` | `GET /usuarios` (paginado), `GET /usuarios/{id}`, `PUT /usuarios/me`, `PUT /usuarios/{id}`, `POST /usuarios/{id}/foto` |
| Barbearias | `barbearia.servico.ts` | `GET /barbearias`, `GET/POST/PUT /{id}` |
| Barbeiros | `barbeiro.servico.ts` | `GET /barbeiros?id_barbearia=`, `GET /{id}`, `POST` |
| Serviços | `servico.servico.ts` | `GET /servicos?id_barbearia=`, `GET /{id}`, `POST`, `PUT /{id}` |
| Disponibilidades | `disponibilidade.servico.ts` | `GET /disponibilidades?id_barbeiro=`, `POST`, `DELETE /{id}` |
| Agendamentos | `agendamento.servico.ts` | `POST`, `GET /meus`, `GET /horarios-disponiveis`, `GET` (gestor, paginado `?pagina=&tamanho=&status=`), `PATCH /{id}/cancelar`, `PATCH /{id}/status` |
| Gamificação | `gamificacao.servico.ts` | `GET /gamificacao/meu-progresso`, `/meu-extrato`, `/niveis` |

**Permissões (resumo):** leitura para qualquer autenticado; gestão de
barbearia/barbeiro/serviço/grade para **admin ou dono**; agenda e mudança de
status para **gestor** (admin/dono/barbeiro). O back protege de verdade; o front
só reflete com as guardas.

---

## 4. Padrões que se repetem

### Listagem paginada

O back devolve sempre o mesmo formato:

```json
{ "itens": [ ... ], "total": 123, "pagina": 1, "tamanho": 20 }
```

No front: signals de `pagina`, `total` e um `computed` de `totalPaginas`; o
rodapé usa as classes globais `.paginacao`. Ver `paginas/clientes` e
`paginas/agenda-gestor`.

### Tratamento de erro

```ts
error: (erro: unknown) => {
  this.mensagemErro.set(mensagemDeErro(erro, 'Não foi possível carregar.'));
}
```

E exibir com `<app-mensagem tipo="erro" [texto]="mensagemErro()" />`.

### Resolver IDs em nomes

O `resolvedor-nomes.servico.ts` converte `id_cliente`/`id_barbeiro`/`id_servico`
em nomes, **com cache** (IDs repetidos não geram nova chamada). Usado nas telas
de agenda e meus agendamentos.

> ⚠️ Limitação conhecida: hoje é **uma chamada por ID**. Em telas com muitos
> agendamentos isso pesa — resolver por lote está na lista de pendências.

### Datas

- O agendamento manda `inicio_em` em **RFC 3339 com fuso**
  (`paraRFC3339ComFusoLocal`).
- A grade de disponibilidade usa **`"HH:MM"`**.
- Para exibir: `formatarDataHora`.

---

## ⚠️ Ao alterar este assunto

Criou serviço, modelo ou consumiu rota nova? Atualize a tabela da seção 3 **e**
acrescente a rota em `configuracao-api.ts`. Se o contrato do back mudou,
atualize também a documentação dele.
