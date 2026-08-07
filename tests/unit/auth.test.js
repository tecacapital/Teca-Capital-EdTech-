/**
 * auth.test.js — Testes do Módulo de Autenticação
 * Teca Capital EdTech
 * 
 * Responsabilidade: Testar as funcionalidades de autenticação,
 * login, registo e recuperação de senha.
 */

const { auth } = require('../../frontend/js/auth');
const { api } = require('../../frontend/js/api');

// Mock do localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

global.localStorage = localStorageMock;

// Mock do api
jest.mock('../../frontend/js/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Módulo de Autenticação', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve autenticar com credenciais válidas', async () => {
      const mockResponse = {
        sucesso: true,
        dados: {
          token: 'mock-jwt-token',
          usuario: {
            id: '1',
            nome: 'Teste',
            email: 'teste@email.com',
            role: 'usuario',
            status_assinatura: 'gratuito',
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await auth.login('teste@email.com', 'Senha123');

      expect(result.sucesso).toBe(true);
      expect(result.usuario).toBeDefined();
      expect(localStorage.getItem('jwt_token')).toBe('mock-jwt-token');
    });

    it('deve rejeitar credenciais inválidas', async () => {
      api.post.mockRejectedValue(new Error('Credenciais inválidas'));

      const result = await auth.login('errado@email.com', 'senhaErrada');

      expect(result.sucesso).toBe(false);
      expect(result.erro).toBeDefined();
    });

    it('deve autenticar como empresa com subutilizador', async () => {
      const mockResponse = {
        sucesso: true,
        dados: {
          token: 'mock-jwt-token',
          usuario: {
            id: '2',
            nome: 'SubUser',
            email: 'empresa@email.com',
            role: 'sub_usuario',
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await auth.login('empresa@email.com', 'Senha123', 'empresa', 'subuser');

      expect(result.sucesso).toBe(true);
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'empresa@email.com',
        senha: 'Senha123',
        tipo: 'empresa',
        subUsuario: 'subuser',
      });
    });
  });

  describe('registro', () => {
    it('deve criar uma nova conta', async () => {
      const mockResponse = {
        sucesso: true,
        dados: {
          usuario: {
            id: '3',
            nome: 'Novo Utilizador',
            email: 'novo@email.com',
            status_assinatura: 'gratuito',
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const dados = {
        nome: 'Novo Utilizador',
        email: 'novo@email.com',
        senha: 'Senha123',
        telefone: '+244 900 000 000',
        tipo_usuario: 'individual',
        plano: 'gratuito',
      };

      const result = await auth.registar(dados);

      expect(result.sucesso).toBe(true);
      expect(api.post).toHaveBeenCalledWith('/auth/registro', dados);
    });

    it('deve rejeitar registo com email existente', async () => {
      api.post.mockRejectedValue(new Error('Email já registado'));

      const result = await auth.registar({
        nome: 'Teste',
        email: 'existente@email.com',
        senha: 'Senha123',
        telefone: '+244 900 000 000',
      });

      expect(result.sucesso).toBe(false);
    });
  });

  describe('recuperação de senha', () => {
    it('deve solicitar recuperação com sucesso', async () => {
      const mockResponse = {
        sucesso: true,
        mensagem: 'Código enviado para o WhatsApp',
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await auth.solicitarRecuperacao('teste@email.com');

      expect(result.sucesso).toBe(true);
      expect(api.post).toHaveBeenCalledWith('/auth/recuperar', { contato: 'teste@email.com' });
    });

    it('deve redefinir senha com token válido', async () => {
      const mockResponse = {
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso',
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await auth.redefinirSenha('123456', 'NovaSenha123');

      expect(result.sucesso).toBe(true);
      expect(api.post).toHaveBeenCalledWith('/auth/redefinir-senha', {
        token: '123456',
        novaSenha: 'NovaSenha123',
      });
    });
  });

  describe('logout', () => {
    it('deve limpar a sessão no logout', () => {
      localStorage.setItem('jwt_token', 'mock-token');
      localStorage.setItem('user_data', JSON.stringify({ nome: 'Teste' }));

      auth.logout();

      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });
});