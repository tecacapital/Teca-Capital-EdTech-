/**
 * api.js — Camada de Comunicação HTTP
 * Teca Capital EdTech
 * 
 * 🌐 API em Produção (Render): https://teca-capital-api.onrender.com
 */

// ✅ IMPORTAR CONFIGURAÇÕES
import config from './config.js';

// ============================================
// URL BASE DA API (forçada para Render)
// ============================================
const API_BASE_URL = config.apiBaseUrl;

// ============================================
// CONFIGURAÇÕES PADRÃO
// ============================================

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
    // Tratamento específico para erro 401
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/frontend/login.html';
      }
    }

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

// ============================================
// EXPORTAÇÕES
// ============================================

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  getToken,
  BASE_URL: API_BASE_URL,
};

export { API_BASE_URL };