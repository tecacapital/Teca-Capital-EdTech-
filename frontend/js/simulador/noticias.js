/**
 * noticias.js — Feed de Notícias do Simulador
 * Teca Capital EdTech
 * 
 * Responsabilidade: Exibir e atualizar o feed de notícias
 * do simulador.
 */

import { appState } from '../state.js';

export function init() {
  // Carregar notícias iniciais
  const noticias = appState.get('simulador.noticias') || [];
  renderizarNoticias(noticias);

  // Inscrever para mudanças
  appState.subscribe('simulador.noticias', (novasNoticias) => {
    renderizarNoticias(novasNoticias);
  });

  // Inscrever para sentimento
  appState.subscribe('simulador.sentimento', (sentimento) => {
    atualizarSentimento(sentimento);
  });

  console.log('Módulo de Notícias inicializado');
}

/**
 * Renderiza o feed de notícias
 */
export function renderizarNoticias(noticias) {
  const feed = document.getElementById('feedNoticias');
  if (!feed) return;

  if (!noticias || noticias.length === 0) {
    feed.innerHTML = `
      <div style="text-align:center;padding:20px 0;color:var(--cor-texto-terciario);">
        <i class="fas fa-newspaper" style="font-size:24px;display:block;margin-bottom:8px;"></i>
        <span style="font-size:13px;">Sem notícias recentes</span>
      </div>
    `;
    return;
  }

  feed.innerHTML = noticias.slice(0, 10).map(n => {
    const severidadeClass = n.severidade === 'positiva' ? 'positiva' : 
                           n.severidade === 'critica' ? 'critica' : 'moderada';
    const categoriaLabel = getCategoriaLabel(n.categoria);

    return `
      <div class="noticia-item">
        <div class="noticia-titulo">
          <span class="categoria-badge">${categoriaLabel}</span>
          ${n.titulo || 'Notícia de Mercado'}
        </div>
        <p class="noticia-texto">${n.texto || n.descricao || ''}</p>
        <span class="noticia-tempo">${formatarTempo(n.criada_em)}</span>
      </div>
    `;
  }).join('');
}

/**
 * Atualiza o indicador de sentimento
 */
function atualizarSentimento(sentimento) {
  const el = document.getElementById('sentimentoMercado');
  if (!el) return;

  let label = 'Neutro';
  let classe = 'neutro';

  if (sentimento >= 70) {
    label = 'Ganância Extrema';
    classe = 'ganancia';
  } else if (sentimento >= 60) {
    label = 'Ganância';
    classe = 'ganancia';
  } else if (sentimento >= 40) {
    label = 'Neutro';
    classe = 'neutro';
  } else if (sentimento >= 30) {
    label = 'Medo';
    classe = 'medo';
  } else {
    label = 'Medo Extremo';
    classe = 'medo';
  }

  el.textContent = label;
  el.className = `sentimento ${classe}`;
}

/**
 * Formata o tempo da notícia
 */
function formatarTempo(data) {
  if (!data) return 'Agora';
  const now = new Date();
  const then = new Date(data);
  const diff = Math.floor((now - then) / (1000 * 60)); // minutos

  if (diff < 1) return 'Agora';
  if (diff < 60) return `${diff}min`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

/**
 * Obtém label da categoria
 */
function getCategoriaLabel(categoria) {
  const labels = {
    'economia': 'Economia',
    'mercados': 'Mercados',
    'empresarial': 'Empresas',
    'geopolitica': 'Geopolítica',
    'commodities': 'Commodities',
    'monetaria': 'Monetária',
    'bancaria': 'Bancária',
  };
  return labels[categoria] || categoria || 'Geral';
}

// Exportar
export const noticias = {
  init,
  renderizarNoticias,
};