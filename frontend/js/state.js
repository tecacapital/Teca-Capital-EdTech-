/**
 * state.js — Estado Local da UI
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar o estado da aplicação no frontend,
 * com observadores para atualização automática da UI.
 */

class AppState {
  constructor() {
    this._state = {
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

    this._observers = {};
    this._persistentKeys = ['ui.tema', 'biblioteca.favoritos'];
  }

  /**
   * Obtém um valor do estado
   */
  get(path) {
    const keys = path.split('.');
    let value = this._state;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  /**
   * Define um valor no estado e notifica observadores
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this._state;
    
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    const oldValue = target[lastKey];
    target[lastKey] = value;

    // Persistir se for uma chave persistente
    if (this._persistentKeys.includes(path)) {
      this._persist(path, value);
    }

    // Notificar observadores
    this._notify(path, value, oldValue);
  }

  /**
   * Atualiza múltiplos valores de uma vez
   */
  update(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.set(path, value);
    }
  }

  /**
   * Inscreve-se para receber notificações de mudanças
   */
  subscribe(path, callback) {
    if (!this._observers[path]) {
      this._observers[path] = [];
    }
    this._observers[path].push(callback);
    
    // Retorna função para cancelar subscrição
    return () => {
      this._observers[path] = this._observers[path].filter(cb => cb !== callback);
    };
  }

  /**
   * Notifica todos os observadores de um caminho
   */
  _notify(path, value, oldValue) {
    if (this._observers[path]) {
      for (const callback of this._observers[path]) {
        try {
          callback(value, oldValue);
        } catch (e) {
          console.error(`Erro no observer de "${path}":`, e);
        }
      }
    }

    // Notificar observadores coringa
    if (this._observers['*']) {
      for (const callback of this._observers['*']) {
        try {
          callback(path, value, oldValue);
        } catch (e) {
          console.error('Erro no observer coringa:', e);
        }
      }
    }
  }

  /**
   * Persiste um valor no localStorage
   */
  _persist(path, value) {
    try {
      localStorage.setItem(`state_${path}`, JSON.stringify(value));
    } catch (e) {
      // Ignorar erros de storage
    }
  }

  /**
   * Carrega valores persistentes do localStorage
   */
  loadPersistent() {
    for (const path of this._persistentKeys) {
      try {
        const data = localStorage.getItem(`state_${path}`);
        if (data) {
          const value = JSON.parse(data);
          const keys = path.split('.');
          const lastKey = keys.pop();
          let target = this._state;
          for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
              target[key] = {};
            }
            target = target[key];
          }
          target[lastKey] = value;
        }
      } catch (e) {
        // Ignorar
      }
    }
  }

  /**
   * Reseta o estado (mantendo autenticação)
   */
  reset() {
    // Preservar autenticação
    const authState = {
      isAuthenticated: this._state.isAuthenticated,
      token: this._state.token,
      user: this._state.user,
    };

    // Resetar estado (mantendo estrutura)
    this._state = {
      ...this._state,
      isAuthenticated: authState.isAuthenticated,
      token: authState.token,
      user: authState.user,
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
        ...this._state.biblioteca,
        filtros: { tipo: 'todos', categoria: 'todos' },
      },
    };

    // Notificar todos os observadores
    this._notify('*', this._state);
  }

  /**
   * Retorna o estado completo (apenas leitura)
   */
  getState() {
    return { ...this._state };
  }
}

// Instância única
export const appState = new AppState();

// Carregar dados persistentes
appState.loadPersistent();