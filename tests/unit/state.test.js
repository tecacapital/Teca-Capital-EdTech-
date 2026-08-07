/**
 * state.test.js — Testes do Módulo de Estado
 * Teca Capital EdTech
 * 
 * Responsabilidade: Testar o gerenciamento de estado da aplicação.
 */

const { appState } = require('../../frontend/js/state');

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

describe('Módulo de Estado', () => {
  beforeEach(() => {
    localStorage.clear();
    // Resetar estado (manter estrutura)
    appState._state = {
      isAuthenticated: false,
      token: null,
      user: null,
      currentPage: 'index',
      simulador: {
        dataSimulada: '2025-01-01',
        velocidade: 1,
        saldoRenda: 0,
        saldoInvestimento: 0,
        posicoes: [],
        ativos: [],
        noticias: [],
        ultimoTick: 0,
      },
      biblioteca: {
        catalogo: [],
        filtros: { tipo: 'todos', categoria: 'todos' },
        favoritos: [],
        modoBloqueado: false,
      },
      ui: {
        menuMobileAberto: false,
        modalAberto: false,
        loading: false,
        tema: 'dark',
      },
    };
    appState._observers = {};
  });

  describe('get e set', () => {
    it('deve definir e obter um valor', () => {
      appState.set('teste.valor', 42);
      expect(appState.get('teste.valor')).toBe(42);
    });

    it('deve retornar undefined para chave inexistente', () => {
      expect(appState.get('inexistente')).toBeUndefined();
    });

    it('deve definir valores aninhados', () => {
      appState.set('simulador.saldoRenda', 100000);
      expect(appState.get('simulador.saldoRenda')).toBe(100000);
    });
  });

  describe('update', () => {
    it('deve atualizar múltiplos valores', () => {
      appState.update({
        'simulador.saldoRenda': 50000,
        'simulador.saldoInvestimento': 100000,
      });

      expect(appState.get('simulador.saldoRenda')).toBe(50000);
      expect(appState.get('simulador.saldoInvestimento')).toBe(100000);
    });
  });

  describe('subscribe', () => {
    it('deve notificar observadores de mudanças', () => {
      const callback = jest.fn();
      appState.subscribe('teste.valor', callback);

      appState.set('teste.valor', 100);

      expect(callback).toHaveBeenCalledWith(100, undefined);
    });

    it('deve notificar observadores coringa', () => {
      const callback = jest.fn();
      appState.subscribe('*', callback);

      appState.set('teste.valor', 100);

      expect(callback).toHaveBeenCalledWith('teste.valor', 100, undefined);
    });

    it('deve permitir cancelar subscrição', () => {
      const callback = jest.fn();
      const unsubscribe = appState.subscribe('teste.valor', callback);

      unsubscribe();
      appState.set('teste.valor', 200);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('persistência', () => {
    it('deve persistir valores no localStorage', () => {
      appState.set('ui.tema', 'light');
      expect(localStorage.getItem('state_ui.tema')).toBe(JSON.stringify('light'));
    });

    it('deve carregar valores persistentes', () => {
      localStorage.setItem('state_ui.tema', JSON.stringify('light'));
      appState.loadPersistent();
      expect(appState.get('ui.tema')).toBe('light');
    });
  });

  describe('reset', () => {
    it('deve resetar o estado mantendo autenticação', () => {
      appState.set('isAuthenticated', true);
      appState.set('token', 'mock-token');
      appState.set('simulador.saldoRenda', 50000);

      appState.reset();

      expect(appState.get('isAuthenticated')).toBe(true);
      expect(appState.get('token')).toBe('mock-token');
      expect(appState.get('simulador.saldoRenda')).toBe(0);
    });
  });
});