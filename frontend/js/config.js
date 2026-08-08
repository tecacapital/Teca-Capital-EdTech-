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
 * 
 * 🌐 Suporte a GitHub Pages: Todos os caminhos são relativos (sem barra inicial)
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

/**
 * Obtém o caminho base do projeto (para GitHub Pages)
 * Ex: '/Teca-Capital-EdTech-/frontend' ou '' em desenvolvimento
 */
function getBasePath() {
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
// 📍 ROTAS DA APLICAÇÃO (sem barras iniciais)
// ============================================

/**
 * ✅ TODAS AS ROTAS SÃO RELATIVAS (sem "/" no início)
 * Isso garante compatibilidade com GitHub Pages e subdiretórios
 */
const ROUTES = {
  // Páginas principais
  home: './index.html',
  login: './login.html',
  registro: './registro.html',
  recuperarSenha: './recuperar-senha.html',
  perfil: './perfil.html',
  
  // Simulador
  simulador: './simulador.html',
  carteira: './carteira.html',
  mercados: './mercados.html',
  ativoDetalhe: './ativo-detalhe.html',
  historico: './historico.html',
  
  // Biblioteca
  biblioteca: './biblioteca.html',
  bibliotecaVideos: './biblioteca-videos.html',
  bibliotecaAudios: './biblioteca-audios.html',
  bibliotecaEbooks: './biblioteca-ebooks.html',
  bibliotecaImagens: './biblioteca-imagens.html',
  
  // Provas e Certificação
  provas: './provas.html',
  iniciarProva: './iniciar-prova.html',
  resultadoProva: './resultado-prova.html',
  certificados: './certificados.html',
  
  // Administrativo
  admin: './admin.html',
  funcionario: './funcionario.html',
  
  // Outras
  referencias: './referencias.html',
  contato: './contato.html',
};

/**
 * Constrói uma URL completa com o BASE_PATH (para navegação)
 * Ex: resolveRoute('login') -> '/Teca-Capital-EdTech-/login.html'
 */
function resolveRoute(routeKey) {
  const route = ROUTES[routeKey];
  if (!route) {
    console.warn(`⚠️ Rota não encontrada: ${routeKey}`);
    return null;
  }
  
  // Se a rota já começa com ./, mantém
  if (route.startsWith('./') || route.startsWith('../')) {
    return route;
  }
  
  // Caso contrário, adiciona ./
  return `./${route}`;
}

/**
 * Obtém o caminho de uma rota (sem BASE_PATH)
 */
function getRoute(routeKey) {
  return ROUTES[routeKey] || null;
}

// ============================================
// 🔗 URLS DA API (caminhos relativos)
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

// Tornar a URL acessível globalmente (para scripts que não usam módulos)
window.API_BASE_URL = API_BASE_URL;
window.BASE_PATH = BASE_PATH;
window.ROUTES = ROUTES;

// Configuração completa
const config = {
  // API
  apiBaseUrl: API_BASE_URL,
  
  // Caminho base (para GitHub Pages)
  basePath: BASE_PATH,
  
  // URLs da API
  urls: API_URLS,
  
  // Rotas da aplicação (HTML)
  routes: ROUTES,
  
  // Ambiente
  environment: detectEnvironment(),
  
  // Versão
  version: '1.0.0',
  
  // Funções utilitárias
  resolveRoute,
  getRoute,
  getBasePath,
};

// ============================================
// 📝 LOG DE INICIALIZAÇÃO
// ============================================

console.log('========================================');
console.log('🔗 [Config] Teca Capital EdTech');
console.log(`🌐 API URL: ${config.apiBaseUrl}`);
console.log(`📁 Base Path: ${BASE_PATH || '(raiz)'}`);
console.log(`📡 Ambiente: ${config.environment.isLocal ? 'Local (Live Server)' : 'Produção'}`);
console.log(`💻 Hostname: ${config.environment.hostname}`);
console.log(`📍 Rotas configuradas: ${Object.keys(ROUTES).length}`);
console.log('========================================');

// ============================================
// EXPORTAÇÕES
// ============================================

export default config;
export { 
  config, 
  API_BASE_URL, 
  BASE_PATH, 
  ROUTES,
  API_URLS,
  resolveRoute,
  getRoute,
  getBasePath,
};