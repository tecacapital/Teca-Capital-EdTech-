/**
 * login.js — Lógica da Página de Login
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar formulários de login,
 * alternância entre individual e empresa.
 */

import { auth } from '../auth.js';
import { toasts } from '../ui/toasts.js';

export function init() {
  // Verificar se já está autenticado
  if (auth.isAuthenticated) {
    window.location.href = '/simulador.html';
    return;
  }
  
  // Configurar tabs
  setupTabs();
  
  // Configurar formulários
  setupForms();
  
  // Configurar toggle de senha
  setupPasswordToggles();
  
  console.log('Página de Login carregada');
}

/**
 * Configura as tabs (Individual / Empresa)
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = {
    individual: document.getElementById('formIndividual'),
    empresa: document.getElementById('formEmpresa'),
  };
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Atualizar tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mostrar formulário correspondente
      const target = tab.dataset.tab;
      Object.entries(forms).forEach(([key, form]) => {
        if (form) {
          form.classList.toggle('active', key === target);
        }
      });
    });
  });
}

/**
 * Configura os formulários de login
 */
function setupForms() {
  // Formulário Individual
  const formIndividual = document.getElementById('formIndividual');
  if (formIndividual) {
    formIndividual.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail')?.value;
      const senha = document.getElementById('loginPassword')?.value;
      const remember = document.getElementById('rememberMe')?.checked;
      
      if (!email || !senha) {
        toasts.erro('Preencha todos os campos');
        return;
      }
      
      // Desabilitar botão
      const btn = formIndividual.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'A entrar...';
      
      try {
        const result = await auth.login(email, senha, 'individual');
        if (!result.sucesso) {
          btn.disabled = false;
          btn.textContent = 'Entrar';
        }
      } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
    });
  }
  
  // Formulário Empresa
  const formEmpresa = document.getElementById('formEmpresa');
  if (formEmpresa) {
    formEmpresa.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('empresaEmail')?.value;
      const subUsuario = document.getElementById('subUsuarioNome')?.value;
      const senha = document.getElementById('empresaPassword')?.value;
      
      if (!email || !subUsuario || !senha) {
        toasts.erro('Preencha todos os campos');
        return;
      }
      
      // Desabilitar botão
      const btn = formEmpresa.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'A entrar...';
      
      try {
        const result = await auth.login(email, senha, 'empresa', subUsuario);
        if (!result.sucesso) {
          btn.disabled = false;
          btn.textContent = 'Entrar como Empresa';
        }
      } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Entrar como Empresa';
      }
    });
  }
}

/**
 * Configura os toggles de senha
 */
function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-wrapper')?.querySelector('input');
      if (!input) return;
      
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });
}

// Exportar
export default { init };