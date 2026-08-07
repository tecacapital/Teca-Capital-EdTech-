/**
 * referencias.js — Lógica da Página de Referências
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar interações da página de referências,
 * tracking de cliques, etc.
 */

export function init() {
  // Configurar tracking de cliques
  setupLinkTracking();
  
  console.log('Página de Referências carregada');
}

/**
 * Configura tracking de cliques nos links de referência
 */
function setupLinkTracking() {
  const links = document.querySelectorAll('.card-referencia');
  
  links.forEach(link => {
    link.addEventListener('click', () => {
      const nome = link.querySelector('h3')?.textContent || 'Link';
      console.log(`[Referência] Clique em: ${nome}`);
      
      // TODO: Integrar com analytics
    });
  });
}

// Exportar
export default { init };