/**
 * home.js — Lógica da Página Inicial
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar interações da página inicial,
 * animações e carregamento de conteúdo.
 */

import { appState } from '../state.js';
import { auth } from '../auth.js';

export function init() {
  // Verificar se o utilizador está autenticado
  const isAuth = auth.isAuthenticated;
  
  // Atualizar CTAs baseado no estado de autenticação
  atualizarCTAs(isAuth);
  
  // Configurar animações de scroll
  setupScrollAnimations();
  
  // Configurar links dos planos
  setupPlanLinks();
  
  console.log('Página Inicial carregada');
}

/**
 * Atualiza os CTAs baseado no estado de autenticação
 */
function atualizarCTAs(isAuth) {
  const ctaPrincipal = document.querySelector('.hero-actions .btn-primario');
  const ctaSecundario = document.querySelector('.hero-actions .btn-secundario');
  
  if (isAuth) {
    if (ctaPrincipal) {
      ctaPrincipal.textContent = 'Ir para o Simulador';
      ctaPrincipal.href = '/simulador.html';
    }
    if (ctaSecundario) {
      ctaSecundario.textContent = 'Ver Biblioteca';
      ctaSecundario.href = '/biblioteca.html';
    }
  } else {
    if (ctaPrincipal) {
      ctaPrincipal.textContent = 'Começar Gratuitamente';
      ctaPrincipal.href = '/registro.html';
    }
    if (ctaSecundario) {
      ctaSecundario.textContent = 'Explorar Simulador';
      ctaSecundario.href = '#funcionalidades';
    }
  }
}

/**
 * Configura animações de scroll (Intersection Observer)
 */
function setupScrollAnimations() {
  const cards = document.querySelectorAll('.card-beneficio, .card-funcionalidade, .card-plano');
  
  if (!('IntersectionObserver' in window)) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });
  
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
  });
}

/**
 * Configura links dos planos para redirecionar com parâmetros
 */
function setupPlanLinks() {
  const planos = document.querySelectorAll('.card-plano .btn');
  
  planos.forEach(btn => {
    const card = btn.closest('.card-plano');
    if (!card) return;
    
    // Detectar qual plano
    const nome = card.querySelector('.card-plano-nome')?.textContent || '';
    
    if (nome.includes('Gratuito')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/registro.html';
      });
    } else if (nome.includes('Individual Pago')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/registro.html?plano=pago';
      });
    } else if (nome.includes('Empresarial')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/contato.html';
      });
    }
  });
}

// Exportar para uso em main.js
export default { init };