# As telas do sistema

> Leia para saber **o que cada tela faz, quem acessa e onde ela está**.
> Índice geral: [`00-VISAO-GERAL.md`](00-VISAO-GERAL.md).
> Cada tela é uma pasta em `src/app/paginas/`.

---

## Públicas (fora do layout do painel)

### `login`
Entrada do sistema. Tem **"Lembrar-me"**, que guarda e-mail e senha no
`localStorage` e pré-preenche no próximo acesso (⚠️ senha em texto puro — só para
dispositivo pessoal). Traz o atalho **"Esqueci minha senha"** e o caminho para o
cadastro. Mostra aviso de sucesso quando se chega vindo do cadastro.

### `cadastro`
Criação de conta, com **foto de perfil opcional** (PNG/JPG até 5 MB, com prévia).
A foto é enviada logo após o registro, usando o token que a própria API de
registro devolve. Se o envio da foto falhar, **o cadastro segue valendo** — a foto
pode ser posta depois. Ao final, volta para o login com aviso de sucesso.

### `esqueci-senha`
Informa o e-mail e pede o link de redefinição. A resposta é **sempre a mesma**,
exista ou não o e-mail — é proposital, para não revelar quais e-mails estão
cadastrados.

### `redefinir-senha`
Aberta pelo link do e-mail (`?token=...`). Três estados: **sem token** (link
inválido, oferece pedir outro), **formulário** de nova senha + confirmação, e
**sucesso** com o caminho para o login.

---

## Internas (dentro do `app-layout-painel`, exigem login)

### `principal` — o painel
Saudação, **cartão de nível** (`app-cartao-nivel`: nível, barra de XP e saldo de
pontos) e cartões de resumo adaptados ao perfil — o cliente vê os próprios
números, o gestor vê também os da barbearia. Traz atalhos rápidos.

> Se a chamada da gamificação falhar, o cartão apenas não aparece e o resto do
> painel continua funcionando.

### `agendar` — cliente marca horário
Fluxo: **barbearia → barbeiro → serviço →** um **calendário do mês** destaca os
dias com vaga; ao clicar no dia aparecem os **horários livres**, calculados pelo
back (`GET /agendamentos/horarios-disponiveis`).

Horários ocupados **nunca aparecem** — a disponibilidade é decidida no servidor,
sem expor a agenda de outros clientes. Um `409` (dois clientes marcando ao mesmo
tempo) é tratado com aviso amigável e recarga da lista.

### `meus-agendamentos` — cliente
Lista e cancela os próprios agendamentos, mostrando os **nomes** de serviço e
barbeiro (resolvidos a partir dos IDs).

### `meu-perfil` — qualquer usuário
Edita o próprio nome, telefone e **foto** (`PUT /usuarios/me` +
`POST /usuarios/{id}/foto`). Ao salvar, a sessão é atualizada para o topo
refletir nome/foto na hora. E-mail e perfil aparecem **só para leitura**. Tem
também o seletor de **tema** (escuro/claro).

### `agenda-gestor` — admin, dono ou barbeiro (`gestorGuarda`)
Lista **paginada** (20 por página) de todos os agendamentos, com **filtro por
status** e mudança de status (confirmar, iniciar, concluir, não compareceu,
cancelar).

⚠️ O filtro é aplicado **no back**, não no front — filtrar localmente pegaria só
os 20 da página atual e daria resultado errado. Ao concluir um atendimento, o
cliente recebe os pontos do serviço.

### `clientes` — admin ou dono (`gestaoGuarda`)
Tabela de usuários com **busca e paginação feitas no back** e **edição inline**.

- Admin edita qualquer um, inclusive o **perfil**; dono edita qualquer usuário
  (inclusive o próprio perfil e outros donos), **menos admin**, e não altera o
  campo perfil — regra também garantida no back.
- Na edição, clicar no **avatar** abre o seletor de foto.
- **No celular (até 768px) a tabela vira cartões empilhados**, com o botão
  "Editar" em largura total — antes ele era cortado e ficava inalcançável.

### `gestao` — admin ou dono (`gestaoGuarda`)
Cadastra a barbearia e, dentro dela:

- **Serviços** — com edição de nome/duração/preço/**pontos** e ativar/desativar.
- **Barbeiros** — vinculando um usuário por um seletor de busca por nome/e-mail
  (quem já é barbeiro daquela barbearia é ocultado).
- **Grade de horários** de cada barbeiro.

---

## ⚠️ Ao alterar este assunto

Criou uma tela, mudou o que ela faz ou quem acessa? Atualize este arquivo **e** a
tabela de rotas em [`02-estrutura-e-arquitetura.md`](02-estrutura-e-arquitetura.md).
