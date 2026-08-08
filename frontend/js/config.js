/**
 * config.js — Configurações Globais do Frontend
 * Teca Capital EdTech
 * 
 * 🌐 API em Produção (Render): https://teca-capital-api.onrender.com
 * 🌐 Frontend (GitHub Pages): https://tecacapital.github.io/Teca-Capital-EdTech-/
 * 
 * ⚠️ IMPORTANTE: Todos os ficheiros HTML estão na RAIZ do projeto.
 *    As rotas são apenas o nome do ficheiro (ex: 'home.html', 'login.html').
 */

// ============================================
// 🚀 URL FIXA DA API (Render - Produção)
// ============================================

const API_BASE_URL = 'https://teca-capital-api.onrender.com';

// ============================================
// 🔧 CONFIGURAÇÕES DE AMBIENTE
// ============================================

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
// 📍 ROTAS DA APLICAÇÃO (APENAS NOME DO FICHEIRO)
// ============================================

/**
 * ✅ TODAS AS ROTAS SÃO APENAS O NOME DO FICHEIRO HTML
 * Os ficheiros estão na RAIZ do projeto
 */
const ROUTES = {
  // Páginas principais
  home: 'index.html',
  login: 'login.html',
  registro: 'registro.html',
  recuperarSenha: 'recuperar-senha.html',
  perfil: 'perfil.html',
  
  // Simulador
  simulador: 'simulador.html',
  carteira: 'carteira.html',
  mercados: 'mercados.html',
  ativoDetalhe: 'ativo-detalhe.html',
  historico: 'historico.html',
  
  // Biblioteca
  biblioteca: 'biblioteca.html',
  bibliotecaVideos: 'biblioteca-videos.html',
  bibliotecaAudios: 'biblioteca-audios.html',
  bibliotecaEbooks: 'biblioteca-ebooks.html',
  bibliotecaImagens: 'biblioteca-imagens.html',
  
  // Provas e Certificação
  provas: 'provas.html',
  iniciarProva: 'iniciar-prova.html',
  resultadoProva: 'resultado-prova.html',
  certificados: 'certificados.html',
  
  // Administrativo (acesso secreto)
  admin: 'admin.html',
  funcionario: 'funcionario.html',
  
  // Outras
  referencias: 'referencias.html',
  contato: 'contato.html',
};

/**
 * Obtém o caminho de uma rota
 */
function getRoute(routeKey) {
  return ROUTES[routeKey] || null;
}

/**
 * Obtém a URL completa para navegação
 */
function getRouteUrl(routeKey) {
  const route = getRoute(routeKey);
  return route || null;
}

// ============================================
// 🔗 URLS DA API
// ============================================

const API_URLS = {
  // Autenticação
  login: '/api/auth/login',
  register: '/api/auth/registro',
  recover: '/api/auth/recuperar',
  resetPassword: '/api/auth/redefinir-senha',
  validateToken: '/api/auth/validar',
  updateProfile: '/api/auth/perfil',
  
  // Simulador
  simuladorEstado: '/api/simulador/estado',
  simuladorTransacao: '/api/simulador/transacao',
  simuladorVelocidade: '/api/simulador/velocidade',
  simuladorCredito: '/api/simulador/credito',
  simuladorReset: '/api/simulador/reset',
  simuladorHistorico: '/api/simulador/historico',
  
  // Biblioteca
  bibliotecaCatalogo: '/api/biblioteca/catalogo',
  bibliotecaConteudo: (id) => `/api/biblioteca/catalogo/${id}`,
  bibliotecaInteragir: (id) => `/api/biblioteca/catalogo/${id}/interagir`,
  bibliotecaFavoritos: '/api/biblioteca/favoritos',
  
  // Provas
  provas: '/api/provas',
  provasSubmeter: '/api/provas/submeter',
  provasCertificados: '/api/provas/certificados',
  
  // Admin
  adminUsuarios: '/api/admin/usuarios',
  adminPagamentosPendentes: '/api/admin/pagamentos/pendentes',
  adminAprovarPagamento: (id) => `/api/admin/pagamentos/${id}/aprovar`,
  adminRejeitarPagamento: (id) => `/api/admin/pagamentos/${id}/rejeitar`,
  adminFuncionarios: '/api/admin/funcionarios',
  
  // Funcionário
  funcionarioPagamentos: '/api/funcionario/pagamentos/pendentes',
  funcionarioBuscarUsuarios: '/api/funcionario/usuarios/buscar',
  
  // Health
  health: '/api/health',
};

// ============================================
// 📦 CONFIGURAÇÃO COMPLETA
// ============================================

// Tornar a URL acessível globalmente
window.API_BASE_URL = API_BASE_URL;
window.ROUTES = ROUTES;

const config = {
  apiBaseUrl: API_BASE_URL,
  urls: API_URLS,
  routes: ROUTES,
  environment: detectEnvironment(),
  version: '1.0.0',
  getRoute,
  getRouteUrl,
};

// ============================================
// 📝 LOG DE INICIALIZAÇÃO
// ============================================

console.log('========================================');
console.log('🔗 [Config] Teca Capital EdTech');
console.log(`🌐 API URL: ${config.apiBaseUrl}`);
console.log(`📡 Ambiente: ${config.environment.isLocal ? 'Local (Live Server)' : 'Produção'}`);
console.log(`📍 Rotas configuradas: ${Object.keys(ROUTES).length}`);
console.log('========================================');

// ============================================
// EXPORTAÇÕES
// ============================================

export default config;
export { 
  config, 
  API_BASE_URL, 
  ROUTES,
  API_URLS,
  getRoute,
  getRouteUrl,
};