/**
 * Configuração central de acesso à API do back-end (barbeariax).
 *
 * O endereço base é "/api" porque, durante o desenvolvimento, o servidor do
 * Angular encaminha tudo que começa com "/api" para o back-end em Go
 * (http://localhost:3001) através do arquivo "proxy.conf.json". Dessa forma não
 * precisamos lidar com CORS nem alterar o back-end.
 */
export const configuracaoApi = {
  /** Caminho base de todas as rotas da API. */
  enderecoBase: '/api',

  /** Rotas de autenticação (login e registro). */
  rotasAutenticacao: {
    login: '/auth/login',
    registrar: '/auth/registrar',
  },

  /** Rotas do módulo de usuários. */
  rotasUsuario: {
    meuPerfil: '/usuarios/me',
    // Listagem de todos os usuários (rota protegida: somente administradores).
    listar: '/usuarios',
  },

  /** Caminho base das barbearias. */
  rotaBarbearias: '/barbearias',

  /** Caminho base dos barbeiros (listagem usa ?id_barbearia=). */
  rotaBarbeiros: '/barbeiros',

  /** Caminho base dos serviços (listagem usa ?id_barbearia=). */
  rotaServicos: '/servicos',

  /** Caminho base das disponibilidades (listagem usa ?id_barbeiro=). */
  rotaDisponibilidades: '/disponibilidades',

  /** Rotas do módulo de agendamentos. */
  rotasAgendamento: {
    base: '/agendamentos',
    meus: '/agendamentos/meus',
  },
};
