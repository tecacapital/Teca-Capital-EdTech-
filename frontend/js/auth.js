/**
 * auth.js — Autenticação e Gestão de Token JWT (ATUALIZADO)
 * Teca Capital EdTech
 * 
 * Responsabilidade: Login, logout, registo, recuperação de senha,
 * e gestão do estado de autenticação.
 * 
 * ATUALIZAÇÃO: Redirecionamento após login/registo para o perfil.
 */

import { api } from './api.js';
import { appState } from './state.js';
import { toasts } from './ui/toasts.js';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

class Auth {
  constructor() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
  }

  /**
   * Inicializa o módulo de autenticação
   */
  async init() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);

    if (token) {
      this.token = token;
      this.isAuthenticated = true;
      appState.set('isAuthenticated', true);
      appState.set('token', token);

      if (userData) {
        try {
          this.user = JSON.parse(userData);
          appState.set('user', this.user);
        } catch (e) {
          // Dados corrompidos
          this.clearSession();
        }
      }

      // Validar token com o backend
      try {
        const response = await api.get('/auth/validar');
        this.user = response.dados?.usuario;
        if (this.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(this.user));
          appState.set('user', this.user);
        }
      } catch (error) {
        // Token inválido ou expirado
        if (error.status === 401) {
          this.clearSession();
        }
      }
    }

    this.updateUI();
    return this.isAuthenticated;
  }

  /**
   * Login de utilizador (ATUALIZADO — redireciona para perfil)
   */
  async login(email, senha, tipo = 'individual', subUsuario = null) {
    try {
      const body = { email, senha, tipo };
      if (tipo === 'empresa' && subUsuario) {
        body.subUsuario = subUsuario;
      }

      const response = await api.post('/auth/login', body);
      
      if (response.dados?.token) {
        this.token = response.dados.token;
        this.user = response.dados.usuario;
        
        localStorage.setItem(TOKEN_KEY, this.token);
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
        
        this.isAuthenticated = true;
        appState.set('isAuthenticated', true);
        appState.set('token', this.token);
        appState.set('user', this.user);

        this.updateUI();
        toasts.sucesso(`Bem-vindo, ${this.user.nome || 'Utilizador'}!`);
        
        // 🔄 REDIRECIONAMENTO: SEMPRE PARA O PERFIL
        window.location.href = '/perfil.html';
        
        return { sucesso: true, usuario: this.user };
      }

      throw new Error('Dados de autenticação inválidos');
    } catch (error) {
      toasts.erro(error.message || 'Erro ao fazer login');
      return { sucesso: false, erro: error.message };
    }
  }

  /**
   * Registo de novo utilizador (ATUALIZADO — redireciona para perfil)
   */
  async registar(dados) {
    try {
      const response = await api.post('/auth/registro', dados);
      
      if (response.sucesso) {
        // Auto-login após registo
        const loginResult = await this.login(dados.email, dados.senha, dados.tipo_usuario);
        
        if (loginResult.sucesso) {
          toasts.sucesso('Conta criada com sucesso!');
          // 🔄 REDIRECIONAMENTO: PARA O PERFIL
          window.location.href = '/perfil.html';
        }
        
        return { sucesso: true, usuario: response.dados?.usuario };
      }
      throw new Error(response.mensagem || 'Erro ao criar conta');
    } catch (error) {
      toasts.erro(error.message || 'Erro ao criar conta');
      return { sucesso: false, erro: error.message };
    }
  }

  /**
   * Solicitar recuperação de senha (via WhatsApp)
   */
  async solicitarRecuperacao(emailOuTelefone) {
    try {
      const response = await api.post('/auth/recuperar', { contato: emailOuTelefone });
      toasts.sucesso('Código enviado para o seu WhatsApp');
      return { sucesso: true, mensagem: response.mensagem };
    } catch (error) {
      toasts.erro(error.message || 'Erro ao solicitar recuperação');
      return { sucesso: false, erro: error.message };
    }
  }

  /**
   * Redefinir senha com token
   */
  async redefinirSenha(token, novaSenha) {
    try {
      const response = await api.post('/auth/redefinir-senha', { token, novaSenha });
      toasts.sucesso('Senha redefinida com sucesso! Faça login.');
      return { sucesso: true };
    } catch (error) {
      toasts.erro(error.message || 'Erro ao redefinir senha');
      return { sucesso: false, erro: error.message };
    }
  }

  /**
   * Logout do utilizador
   */
  logout() {
    this.clearSession();
    this.updateUI();
    toasts.info('Sessão encerrada');
    window.location.href = '/login.html';
  }

  /**
   * Limpa os dados da sessão
   */
  clearSession() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    appState.set('isAuthenticated', false);
    appState.set('token', null);
    appState.set('user', null);
  }

  /**
   * Atualiza a interface com base no estado de autenticação
   */
  updateUI() {
    const isAuth = this.isAuthenticated;
    
    // Mostrar/ocultar elementos de autenticação
    document.querySelectorAll('[data-auth="true"]').forEach(el => {
      el.style.display = isAuth ? '' : 'none';
    });
    
    document.querySelectorAll('[data-auth="false"]').forEach(el => {
      el.style.display = isAuth ? 'none' : '';
    });

    // Atualizar nome do utilizador
    if (isAuth && this.user) {
      const nameEls = document.querySelectorAll('[data-user-name]');
      nameEls.forEach(el => {
        el.textContent = this.user.nome || 'Utilizador';
      });
    }
  }

  /**
   * Verifica se o utilizador tem permissão para aceder a uma página/rota
   */
  temPermissao(rolesPermitidas) {
    if (!this.isAuthenticated || !this.user) return false;
    return rolesPermitidas.includes(this.user.role);
  }
}

// Instância única
export const auth = new Auth();