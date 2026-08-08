/**
 * config.js — Configurações Globais do Frontend
 * Teca Capital EdTech
 * 
 * 🌐 API em Produção (Render): https://teca-capital-api.onrender.com
 * 
 * ⚠️ IMPORTANTE: Este ficheiro força a conexão com a API do Render
 *    mesmo em ambiente local (Live Server, localhost, etc.)
 * 
 *    Para usar o backend local, altere a variável abaixo para:
 *    const API_BASE_URL = 'http://localhost:3000';
 */

// ============================================
// 🚀 URL FIXA DA API (Render - Produção)
// ============================================

/**
 * URL base da API hospedada no Render
 * 
 * ✅ Utilizada em TODOS os ambientes:
 *    - Desenvolvimento local (Live Server)
 *    - Produção (GitHub Pages)
 */
const API_BASE_URL = 'https://teca-capital-api.onrender.com';

// ============================================
// 🔧 CONFIGURAÇÕES DE AMBIENTE (para debug)
// ============================================

/**
 * Detecta o ambiente atual (apenas para informação)
 */
function detectEnvironment() {
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  
  return {
    isLocal,
    isProduction: !isLocal,
    hostname,
    apiUrl: API_BASE_URL,
  };
}

// ============================================
// 📦 EXPORTAÇÕES
// ============================================

// Tornar a URL acessível globalmente (para scripts que não usam módulos)
window.API_BASE_URL = API_BASE_URL;

// Configuração completa
const config = {
  // API
  apiBaseUrl: API_BASE_URL,
  
  // URLs específicas
  urls: {
    login: '/api/auth/login',
    register: '/api/auth/registro',
    recover: '/api/auth/recuperar',
    resetPassword: '/api/auth/redefinir-senha',
    validateToken: '/api/auth/validar',
    simuladorEstado: '/api/simulador/estado',
    simuladorTransacao: '/api/simulador/transacao',
    simuladorVelocidade: '/api/simulador/velocidade',
    simuladorCredito: '/api/simulador/credito',
    simuladorReset: '/api/simulador/reset',
    simuladorHistorico: '/api/simulador/historico',
    bibliotecaCatalogo: '/api/biblioteca/catalogo',
    bibliotecaConteudo: (id) => `/api/biblioteca/catalogo/${id}`,
    bibliotecaInteragir: (id) => `/api/biblioteca/catalogo/${id}/interagir`,
    bibliotecaFavoritos: '/api/biblioteca/favoritos',
    provas: '/api/provas',
    provasSubmeter: '/api/provas/submeter',
    provasCertificados: '/api/provas/certificados',
    adminUsuarios: '/api/admin/usuarios',
    adminPagamentosPendentes: '/api/admin/pagamentos/pendentes',
    adminAprovarPagamento: (id) => `/api/admin/pagamentos/${id}/aprovar`,
    adminRejeitarPagamento: (id) => `/api/admin/pagamentos/${id}/rejeitar`,
    adminFuncionarios: '/api/admin/funcionarios',
    funcionarioPagamentos: '/api/funcionario/pagamentos/pendentes',
    funcionarioBuscarUsuarios: '/api/funcionario/usuarios/buscar',
    health: '/api/health',
  },
  
  // Ambiente
  environment: detectEnvironment(),
  
  // Versão
  version: '1.0.0',
};

// ============================================
// 📝 LOG DE INICIALIZAÇÃO
// ============================================

console.log('========================================');
console.log('🔗 [Config] Teca Capital EdTech');
console.log(`🌐 API URL: ${config.apiBaseUrl}`);
console.log(`📡 Ambiente: ${config.environment.isLocal ? 'Local (Live Server)' : 'Produção'}`);
console.log(`💻 Hostname: ${config.environment.hostname}`);
console.log('========================================');

// ============================================
// EXPORTAÇÕES
// ============================================

export default config;
export { config, API_BASE_URL };