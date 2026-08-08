/**
 * main.js — Bootstrap da aplicação
 * Teca Capital EdTech
 * 
 * Responsabilidade: Detetar a página atual, inicializar módulos,
 * carregar estado de autenticação e configurar eventos globais.
 * 
 * 🌐 Suporte a GitHub Pages (subdiretório) e ambiente local
 * 🔐 Atalho secreto: Ctrl+S → admin.html
 * 📱 Acesso mobile: ?access=admin ou ?access=staff
 */

import { api } from './api.js';
import { auth } from './auth.js';
import { appState } from './state.js';
import { router } from './router.js';
import { toasts } from './ui/toasts.js';

// ============================================
// MÓDULOS POR PÁGINA
// ============================================

const pageModules = {
  'index': () => import('./pages/home.js'),
  'login': () => import('./pages/login.js'),
  'registro': () => import('./pages/registro.js'),
  'recuperar-senha': () => import('./pages/recuperar-senha.js'),
  'simulador': () => import('./simulador/dashboard.js'),
  'carteira': () => import('./simulador/carteira.js'),
  'mercados': () => import('./simulador/mercados.js'),
  'ativo-detalhe': () => import('./simulador/mercados.js'),
  'historico': () => import('./simulador/dashboard.js'),
  'biblioteca': () => import('./biblioteca/catalogo.js'),
  'biblioteca-videos': () => import('./biblioteca/biblioteca-videos.js'),
  'biblioteca-audios': () => import('./biblioteca/biblioteca-audios.js'),
  'biblioteca-ebooks': () => import('./biblioteca/biblioteca-ebooks.js'),
  'biblioteca-imagens': () => import('./biblioteca/biblioteca-imagens.js'),
  'referencias': () => import('./pages/referencias.js'),
  'contato': () => import('./pages/contato.js'),
  'admin': () => import('./pages/admin.js'),
  'funcionario': () => import('./pages/funcionario.js'),
  'perfil': () => import('./pages/perfil.js'),
  'provas': () => import('./pages/provas.js'),
  'iniciar-prova': () => import('./pages/provas.js'),
  'resultado-prova': () => import('./pages/provas.js'),
  'certificados': () => import('./pages/provas.js'),
};

/**
 * Obtém o nome da página atual a partir do caminho da URL
 */
function getPageName() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  return filename.replace('.html', '') || 'index';
}

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  // 1. Verificar acesso privado (mobile)
  checkMobilePrivateAccess();

  // 2. Configurar router
  router.init();

  // 3. Verificar autenticação
  await auth.init();

  // 4. Detetar página atual
  const pageName = getPageName();
  appState.set('currentPage', pageName);

  // 5. Carregar módulo da página
  if (pageModules[pageName]) {
    try {
      const module = await pageModules[pageName]();
      if (module.init) {
        module.init();
      }
    } catch (error) {
      console.error(`Erro ao carregar módulo da página "${pageName}":`, error);
    }
  }

  // 6. Configurar navegação SPA
  setupNavigation();

  // 7. Configurar menu mobile
  setupMobileMenu();

  // 8. Configurar logout global
  setupLogout();

  // 9. Configurar toasts
  setupToasts();

  // 10. Configurar atalho secreto (Ctrl+S)
  setupSecretShortcut();

  console.log(`🚀 Teca Capital EdTech — Página: ${pageName}`);
}

// ============================================
// 🔐 ATALHO SECRETO (Ctrl + S)
// ============================================

function setupSecretShortcut() {
  document.addEventListener('keydown', function(event) {
    // Verifica Ctrl + S (ou Cmd + S no Mac)
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault(); // Impede o "Guardar Página" do browser
      
      console.log('🔐 Atalho secreto acionado: Acedendo à área administrativa...');
      
      // Redireciona para o painel administrativo
      window.location.href = 'admin.html';
    }
  });
}

// ============================================
// 📱 ACESSO PRIVADO VIA URL (Mobile)
// ============================================

function checkMobilePrivateAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessType = urlParams.get('access');

  if (accessType === 'admin') {
    console.log('🔐 Acesso administrativo via URL detectado');
    window.location.href = 'admin.html';
  } else if (accessType === 'staff' || accessType === 'funcionario') {
    console.log('🔐 Acesso funcionário via URL detectado');
    window.location.href = 'funcionario.html';
  }
}

// ============================================
// NAVEGAÇÃO SPA (SIMPLIFICADA)
// ============================================

function setupNavigation() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    
    // Ignorar links vazios, âncoras, externos
    if (!href || href === '#' || href.startsWith('#')) return;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.getAttribute('target') === '_blank' || link.hasAttribute('download')) return;

    // Ignorar links administrativos (não aparecem no menu)
    if (href.includes('admin.html') || href.includes('funcionario.html')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Navegação direta para o ficheiro HTML na raiz
      const targetUrl = href.startsWith('./') ? href.substring(2) : href;
      router.navigate(targetUrl);
    });
  });
}

// ============================================
// MENU MOBILE
// ============================================

function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('menuMobileOverlay');
  const close = document.getElementById('menuMobileFechar');

  if (!toggle || !overlay) return;

  const openMenu = () => {
    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    overlay.classList.remove('ativo');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', openMenu);
  
  if (close) {
    close.addEventListener('click', closeMenu);
  }

  // Fechar ao clicar num link
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fechar ao clicar fora
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeMenu();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('ativo')) {
      closeMenu();
    }
  });
}

// ============================================
// LOGOUT E TOASTS
// ============================================

function setupLogout() {
  const buttons = document.querySelectorAll('#btnLogout');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      auth.logout();
    });
  });
}

function setupToasts() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

// ============================================
// EXPORTAÇÕES E INICIALIZAÇÃO
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export const main = { init };