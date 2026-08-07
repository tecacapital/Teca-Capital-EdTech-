/**
 * portfolio-engine.test.js — Testes do Motor de Carteira
 * Teca Capital EdTech
 * 
 * Responsabilidade: Testar as operações de compra, venda,
 * corretagem e impostos.
 */

const { portfolioEngine } = require('../../backend/engine/user/portfolio-engine');
const { stateManager } = require('../../backend/engine/core/state-manager');

// Mock do stateManager
jest.mock('../../backend/engine/core/state-manager', () => ({
  stateManager: {
    getAtivo: jest.fn(),
  },
}));

describe('Motor de Carteira', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSession = {
      usuarioId: 'test-user',
      carteira: {
        renda: 100000,
        investimento: 50000,
        moedas: {
          AOA: 100000,
          USD: 1000,
        },
      },
      posicoes: [],
      historico: [],
      dividas: [],
      hipotecas: [],
    };
  });

  describe('compra', () => {
    it('deve comprar um ativo com sucesso', () => {
      stateManager.getAtivo.mockReturnValue({
        id: 'AO_BANCA_BAII',
        nome: 'Banco Angolano de Investimentos',
        preco: 15000,
        moeda: 'AOA',
      });

      const result = portfolioEngine.comprar(
        'test-user',
        'AO_BANCA_BAII',
        10,
        mockSession
      );

      expect(result.sucesso).toBe(true);
      expect(mockSession.posicoes.length).toBe(1);
      expect(mockSession.posicoes[0].quantidade).toBe(10);
      expect(mockSession.carteira.moedas.AOA).toBeLessThan(100000);
    });

    it('deve rejeitar compra com saldo insuficiente', () => {
      stateManager.getAtivo.mockReturnValue({
        id: 'AO_BANCA_BAII',
        preco: 15000,
        moeda: 'AOA',
      });

      expect(() => {
        portfolioEngine.comprar(
          'test-user',
          'AO_BANCA_BAII',
          100, // 1.500.000 Kz, saldo insuficiente
          mockSession
        );
      }).toThrow('Saldo insuficiente em AOA');
    });

    it('deve rejeitar compra de ativo inexistente', () => {
      stateManager.getAtivo.mockReturnValue(null);

      expect(() => {
        portfolioEngine.comprar(
          'test-user',
          'ATIVO_INEXISTENTE',
          10,
          mockSession
        );
      }).toThrow('Ativo não encontrado');
    });

    it('deve rejeitar compra com posições excedidas', () => {
      // Adicionar posições até o limite
      for (let i = 0; i < 100; i++) {
        mockSession.posicoes.push({ id: `pos_${i}`, quantidade: 1 });
      }

      stateManager.getAtivo.mockReturnValue({
        id: 'AO_BANCA_BAII',
        preco: 15000,
        moeda: 'AOA',
      });

      expect(() => {
        portfolioEngine.comprar(
          'test-user',
          'AO_BANCA_BAII',
          1,
          mockSession
        );
      }).toThrow('Número máximo de posições atingido');
    });
  });

  describe('venda', () => {
    beforeEach(() => {
      // Adicionar uma posição para vender
      mockSession.posicoes = [{
        id: 'pos_001',
        ativo_id: 'AO_BANCA_BAII',
        quantidade: 10,
        preco_medio: 15000,
        moeda: 'AOA',
        total_investido: 150000,
      }];
    });

    it('deve vender um ativo com sucesso', () => {
      stateManager.getAtivo.mockReturnValue({
        id: 'AO_BANCA_BAII',
        preco: 16000, // Valorizou
        moeda: 'AOA',
        pais: 'Angola',
      });

      const result = portfolioEngine.vender(
        'test-user',
        'pos_001',
        5,
        mockSession
      );

      expect(result.sucesso).toBe(true);
      expect(result.lucro).toBeGreaterThan(0);
      expect(mockSession.posicoes[0].quantidade).toBe(5);
    });

    it('deve rejeitar venda com quantidade insuficiente', () => {
      stateManager.getAtivo.mockReturnValue({
        id: 'AO_BANCA_BAII',
        preco: 15000,
        moeda: 'AOA',
      });

      expect(() => {
        portfolioEngine.vender(
          'test-user',
          'pos_001',
          20, // Mais do que tem
          mockSession
        );
      }).toThrow('Quantidade insuficiente');
    });

    it('deve rejeitar venda de posição inexistente', () => {
      expect(() => {
        portfolioEngine.vender(
          'test-user',
          'pos_inexistente',
          1,
          mockSession
        );
      }).toThrow('Posição não encontrada');
    });

    it('deve remover posição quando quantidade chega a zero', () => {
      stateManager.getAtivo.mockReturnValue({
        id: 'AO_BANCA_BAII',
        preco: 15000,
        moeda: 'AOA',
        pais: 'Angola',
      });

      portfolioEngine.vender(
        'test-user',
        'pos_001',
        10, // Vender tudo
        mockSession
      );

      expect(mockSession.posicoes.length).toBe(0);
    });
  });
});