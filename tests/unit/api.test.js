/**
 * api.test.js — Testes do Módulo de API
 * Teca Capital EdTech
 * 
 * Responsabilidade: Testar a camada de comunicação HTTP.
 */

const { api } = require('../../frontend/js/api');

// Mock do fetch
global.fetch = jest.fn();

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
};

global.localStorage = localStorageMock;

describe('Módulo de API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('GET', () => {
    it('deve fazer uma requisição GET com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sucesso: true, dados: { test: 'data' } }),
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await api.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result.sucesso).toBe(true);
    });

    it('deve incluir token de autenticação se existir', async () => {
      localStorage.setItem('jwt_token', 'mock-token');

      const mockResponse = {
        ok: true,
        json: async () => ({ sucesso: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('deve tratar erros de rede', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(api.get('/test')).rejects.toThrow('Network error');
    });
  });

  describe('POST', () => {
    it('deve fazer uma requisição POST com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sucesso: true, dados: { id: 1 } }),
      };
      fetch.mockResolvedValue(mockResponse);

      const body = { nome: 'Teste' };
      const result = await api.post('/test', body);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result.sucesso).toBe(true);
    });
  });

  describe('PUT', () => {
    it('deve fazer uma requisição PUT com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sucesso: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      const body = { id: 1, nome: 'Atualizado' };
      await api.put('/test/1', body);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('DELETE', () => {
    it('deve fazer uma requisição DELETE com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sucesso: true }),
      };
      fetch.mockResolvedValue(mockResponse);

      await api.delete('/test/1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('upload', () => {
    it('deve fazer upload de ficheiro com FormData', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ sucesso: true, url: 'http://example.com/file' }),
      };
      fetch.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('file', 'test content');

      await api.upload('/upload', formData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/upload'),
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      );
    });
  });

  describe('tratamento de erros', () => {
    it('deve tratar erro 401 (não autenticado)', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ mensagem: 'Token inválido' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.get('/protected')).rejects.toMatchObject({
        status: 401,
        message: 'Token inválido',
      });
    });

    it('deve tratar erro 403 (proibido)', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({ mensagem: 'Acesso negado' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.get('/admin')).rejects.toMatchObject({
        status: 403,
      });
    });

    it('deve tratar erro 404 (não encontrado)', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ mensagem: 'Recurso não encontrado' }),
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(api.get('/inexistente')).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});