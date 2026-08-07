/**
 * main.js — Bootstrap da aplicação
 * Teca Capital EdTech
 * 
 * Responsabilidade: Detetar a página atual, inicializar módulos,
 * carregar estado de autenticação e configurar eventos globais.
 */

import { api } from './api.js';
import { auth } from './auth.js';
import { appState } from './state.js';
import { router } from './router.js';
import { toasts } from './ui/toasts.js';

// Módulos específicos por página (carregados dinamicamente)
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

/**
 * Inicializa a aplicação
 */
async function init() {
  // 1. Configurar router
  router.init();

  // 2. Verificar autenticação
  await auth.init();

  // 3. Detetar página atual
  const pageName = getPageName();
  appState.set('currentPage', pageName);

  // 4. Carregar módulo da página
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

  // 5. Configurar navegação SPA
  setupNavigation();

  // 6. Configurar menu mobile
  setupMobileMenu();

  // 7. Configurar logout global
  setupLogout();

  // 8. Configurar toasts
  setupToasts();

  console.log(`Teca Capital EdTech — Página: ${pageName}`);
}

/**
 * Configura navegação SPA simulada
 */
function setupNavigation() {
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    // Ignorar links com href vazio ou âncoras
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) return;
    
    // Ignorar links com target="_blank" ou download
    if (link.getAttribute('target') === '_blank' || link.hasAttribute('download')) return;

    link.addEventListener('click', (e) => {
      // Ignorar se for link administrativo oculto
      if (href === '/admin.html' || href === '/funcionario.html') return;

      e.preventDefault();
      router.navigate(href);
    });
  });
}

/**
 * Configura menu mobile (hambúrguer)
 */
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

/**
 * Configura logout global
 */
function setupLogout() {
  const buttons = document.querySelectorAll('#btnLogout');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      auth.logout();
    });
  });
}

/**
 * Configura sistema de toasts
 */
function setupToasts() {
  // Garantir que o container existe
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exportar para uso em outros módulos
export const main = { init };