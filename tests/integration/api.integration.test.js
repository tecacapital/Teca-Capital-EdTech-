/**
 * api.integration.test.js — Testes de Integração da API
 * Teca Capital EdTech
 * 
 * Responsabilidade: Testar a integração entre frontend e backend.
 */

const request = require('supertest');
const app = require('../../backend/index');
const { pool } = require('../../backend/config/db');

// Mock do banco de dados
jest.mock('../../backend/config/db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
}));

describe('Testes de Integração da API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('deve retornar status online', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('online');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Autenticação', () => {
    it('deve rejeitar login sem credenciais', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.erro.codigo).toBe('ERRO_VALIDACAO');
    });

    it('deve rejeitar registo com dados incompletos', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send({ nome: 'Teste' })
        .expect(400);

      expect(response.body.sucesso).toBe(false);
    });
  });

  describe('Biblioteca', () => {
    it('deve retornar catálogo', async () => {
      // Mock da query
      const mockCatalogo = {
        conteudos: [
          { id: 'vid_01', titulo: 'Vídeo Teste', tipo: 'video' },
        ],
      };
      
      // Simular resposta
      const response = await request(app)
        .get('/api/biblioteca/catalogo')
        .expect(200);

      // Verificar estrutura
      expect(response.body).toHaveProperty('sucesso');
    });
  });

  describe('Simulador', () => {
    it('deve rejeitar acesso sem autenticação', async () => {
      const response = await request(app)
        .get('/api/simulador/estado')
        .expect(401);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.erro.codigo).toBe('TOKEN_AUSENTE');
    });
  });
});