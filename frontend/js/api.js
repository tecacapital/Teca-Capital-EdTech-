/**
 * api.js — Camada de Comunicação HTTP
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar todas as chamadas fetch ao backend,
 * com tratamento de autenticação, erros e retry.
 * 
 * 🌐 API em Produção: https://teca-capital-api.onrender.com
 */

// ============================================
// ✅ URL BASE DA API EM PRODUÇÃO
// ============================================
const API_BASE_URL = 'https://teca-capital-api.onrender.com';

// ============================================
// ⚠️ URLS PARA AMBIENTES DE DESENVOLVIMENTO
// (descomentar conforme necessário)
// ============================================
// const API_BASE_URL = 'http://localhost:3000';  // Desenvolvimento local
// const API_BASE_URL = 'https://teca-capital-api.onrender.com';  // Produção

/**
 * Configuração padrão para requisições
 */
const defaultConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

/**
 * Obtém o token JWT do localStorage
 */
function getToken() {
  return localStorage.getItem('jwt_token');
}

/**
 * Cria headers com autenticação
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    ...defaultConfig.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Processa a resposta da API
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = { mensagem: 'Erro ao processar resposta do servidor' };
  }

  if (!response.ok) {
    const error = new Error(data.mensagem || `Erro ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * GET — Obter dados
 */
async function get(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

/**
 * POST — Criar dados
 */
async function post(endpoint, body, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

/**
 * PUT — Atualizar dados
 */
async function put(endpoint, body, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

/**
 * PATCH — Atualização parcial
 */
async function patch(endpoint, body, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

/**
 * DELETE — Remover dados
 */
async function del(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'DELETE',
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

/**
 * Upload de ficheiro (multipart/form-data)
 */
async function upload(endpoint, formData, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const config = {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

// API pública
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  getToken,
  // URL base exposta para debug
  BASE_URL: API_BASE_URL,
};