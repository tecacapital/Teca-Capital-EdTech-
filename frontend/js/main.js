/**
 * main.js — Bootstrap da aplicação
 * Teca Capital EdTech
 * 
 * Responsabilidade: Detetar a página atual, inicializar módulos,
 * carregar estado de autenticação e configurar eventos globais.
 * 
 * 🌐 Suporte a GitHub Pages (subdiretório) e ambiente local
 */

import { api } from './api.js';
import { auth } from './auth.js';
import { appState } from './state.js';
import { router } from './router.js';
import { toasts } from './ui/toasts.js';

// ============================================
// CONFIGURAÇÃO DE BASE PATH
// ============================================

/**
 * Obtém o caminho base do projeto (para GitHub Pages)
 * Ex: '/Teca-Capital-EdTech-/frontend' ou '' em desenvolvimento
 */
function getBasePath() {
  // Deteta se está em subdiretório do GitHub Pages
  const pathname = window.location.pathname;
  
  // Se contém '/Teca-Capital-EdTech-', extrai o prefixo
  if (pathname.includes('/Teca-Capital-EdTech-')) {
    const match = pathname.match(/^(\/Teca-Capital-EdTech-[^/]*)/);
    if (match) {
      return match[1];
    }
  }
  
  // Fallback: caminho vazio (desenvolvimento local ou raiz)
  return '';
}

const BASE_PATH = getBasePath();

// ============================================
// MÓDULOS POR PÁGINA (caminhos relativos)
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
  // Remove o BASE_PATH se existir
  const cleanPath = path.replace(BASE_PATH, '');
  const filename = cleanPath.split('/').pop() || 'index.html';
  return filename.replace('.html', '') || 'index';
}

/**
 * Constrói uma URL completa com o BASE_PATH
 * Ex: resolveUrl('./pages/login.html') -> '/Teca-Capital-EdTech-/pages/login.html'
 */
function resolveUrl(path) {
  // Se já começa com /, usa como está
  if (path.startsWith('/')) {
    return path;
  }
  // Se começa com ./ ou ../, mantém relativo
  if (path.startsWith('.') || path.startsWith('..')) {
    return path;
  }
  // Caso contrário, retorna o caminho original
  return path;
}

/**
 * Constrói URL para navegação (com BASE_PATH)
 */
function buildUrl(path) {
  // Remove barra inicial se existir
  const cleanPath = path.replace(/^\//, '');
  // Se não começa com ./ e não é vazio, adiciona ./
  const relativePath = cleanPath && !cleanPath.startsWith('.') && !cleanPath.startsWith('..') 
    ? `./${cleanPath}` 
    : cleanPath || './';
  return relativePath;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

async function init() {
  // 1. Configurar router (com base path)
  router.init(BASE_PATH);

  // 2. Verificar autenticação
  await auth.init();

  // 3. Detetar página atual
  const pageName = getPageName();
  appState.set('currentPage', pageName);
  appState.set('basePath', BASE_PATH);

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

  console.log(`🚀 Teca Capital EdTech — Página: ${pageName}`);
  console.log(`📁 Base Path: ${BASE_PATH || '(raiz)'}`);
}

// ============================================
// NAVEGAÇÃO SPA
// ============================================

function setupNavigation() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    
    // Ignorar links vazios, âncoras, externos
    if (!href || href === '#' || href.startsWith('#')) return;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.getAttribute('target') === '_blank' || link.hasAttribute('download')) return;

    // Ignorar links administrativos
    if (href.includes('admin.html') || href.includes('funcionario.html')) return;

    // Links com caminho absoluto ou relativo
    // Se o href começa com /, removemos para ficar relativo
    let cleanHref = href;
    if (href.startsWith('/')) {
      cleanHref = href.substring(1);
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Construir URL completa com base path
      const targetUrl = cleanHref.startsWith('./') || cleanHref.startsWith('../')
        ? cleanHref
        : `./${cleanHref}`;
      
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
  // Garantir que o container existe
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

// ============================================
// EXPORTAÇÕES E INICIALIZAÇÃO
// ============================================

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exportar para uso em outros módulos
export const main = { 
  init, 
  getBasePath, 
  BASE_PATH,
  resolveUrl,
  buildUrl,
};