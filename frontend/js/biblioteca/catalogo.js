/**
 * catalogo.js — Carregamento e Gestão do Catálogo
 * Teca Capital EdTech
 * 
 * Responsabilidade: Carregar o catálogo da Biblioteca,
 * renderizar os conteúdos e gerenciar a interação.
 */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { appState } from '../state.js';
import { components } from '../ui/components.js';
import { modals } from '../ui/modals.js';
import { toasts } from '../ui/toasts.js';

let catalogo = [];
let favoritos = [];
let modoBloqueado = false;

/**
 * Inicializa o módulo da biblioteca
 */
export async function init() {
  // Verificar se o utilizador tem acesso à biblioteca
  const user = appState.get('user');
  modoBloqueado = !user || user.status_assinatura !== 'pago';
  
  if (modoBloqueado) {
    mostrarConteudoBloqueado();
  }

  // Carregar favoritos
  carregarFavoritos();

  // Configurar eventos
  setupEvents();

  // Carregar catálogo
  await carregarCatalogo();
}

/**
 * Carrega o catálogo da biblioteca
 */
async function carregarCatalogo() {
  try {
    // Se bloqueado, carregar apenas dados básicos
    const endpoint = modoBloqueado ? '/biblioteca/catalogo?resumido=true' : '/biblioteca/catalogo';
    const response = await api.get(endpoint);
    
    catalogo = response.dados || [];
    appState.set('biblioteca.catalogo', catalogo);
    
    renderizarCatalogo();
  } catch (error) {
    toasts.erro('Erro ao carregar catálogo');
    console.error(error);
  }
}

/**
 * Renderiza o catálogo na grid
 */
function renderizarCatalogo() {
  const grid = document.getElementById('bibliotecaGrid');
  if (!grid) return;

  const { tipo, categoria } = appState.get('biblioteca.filtros') || { tipo: 'todos', categoria: 'todos' };
  
  const filtrados = catalogo.filter(item => {
    if (tipo !== 'todos' && item.tipo !== tipo) return false;
    if (categoria !== 'todos' && item.categoria !== categoria) return false;
    return true;
  });

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--cor-texto-secundario);">
        <i class="fas fa-search" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cor-texto-terciario);"></i>
        <h3>Nenhum conteúdo encontrado</h3>
        <p>Tente ajustar os filtros ou a busca</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  
  filtrados.forEach(item => {
    const card = components.criarCardConteudo(item, (dados) => {
      abrirConteudo(dados);
    });
    
    // Verificar se é favorito
    const favBtn = card.querySelector('.btn-favorito');
    if (favoritos.includes(item.id)) {
      favBtn?.classList.add('ativo');
    }
    
    // Evento de favorito
    favBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorito(item.id);
    });
    
    grid.appendChild(card);
  });
}

/**
 * Abre um conteúdo (vídeo, áudio, e-book, imagem)
 */
function abrirConteudo(item) {
  if (modoBloqueado) {
    toasts.alerta('Este conteúdo está disponível apenas para contas pagas');
    return;
  }

  switch (item.tipo) {
    case 'video':
      abrirVideo(item);
      break;
    case 'audio':
      abrirAudio(item);
      break;
    case 'ebook':
      abrirEbook(item);
      break;
    case 'imagem':
      abrirImagem(item);
      break;
    default:
      toasts.info('Tipo de conteúdo não suportado');
  }
}

/**
 * Abre um vídeo no modal
 */
function abrirVideo(item) {
  const modal = document.getElementById('modalVideo');
  if (!modal) return;

  const titulo = document.getElementById('modalVideoTitulo');
  const video = document.getElementById('videoPlayer');
  const descricao = document.getElementById('videoDescricao');
  const likes = document.getElementById('videoLikes');
  const dislikes = document.getElementById('videoDislikes');

  if (titulo) titulo.textContent = item.titulo;
  if (descricao) descricao.textContent = item.descricao || '';
  if (likes) likes.textContent = item.likes || 0;
  if (dislikes) dislikes.textContent = item.dislikes || 0;
  
  if (video) {
    video.src = item.arquivo || '';
    video.load();
  }

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Abre um áudio no modal
 */
function abrirAudio(item) {
  const modal = document.getElementById('modalAudio');
  if (!modal) return;

  const titulo = document.getElementById('modalAudioTitulo');
  const descricao = document.getElementById('audioDescricao');
  const audio = document.getElementById('audioPlayer');

  if (titulo) titulo.textContent = item.titulo;
  if (descricao) descricao.textContent = item.descricao || '';
  
  if (audio) {
    audio.src = item.arquivo || '';
    audio.load();
  }

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Abre um e-book
 */
function abrirEbook(item) {
  const modal = document.getElementById('modalEbook');
  if (!modal) return;

  const titulo = document.getElementById('modalEbookTitulo');
  const descricao = document.getElementById('ebookDescricao');
  const download = document.getElementById('btnDownloadEbook');

  if (titulo) titulo.textContent = item.titulo;
  if (descricao) descricao.textContent = item.descricao || '';
  if (download) {
    download.href = item.arquivo || '#';
    download.download = `${item.titulo}.pdf`;
  }

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Abre uma imagem
 */
function abrirImagem(item) {
  const modal = document.getElementById('modalImagem');
  if (!modal) return;

  const titulo = document.getElementById('modalImagemTitulo');
  const descricao = document.getElementById('imagemDescricao');
  const imagem = document.getElementById('imagemVisualizacao');

  if (titulo) titulo.textContent = item.titulo;
  if (descricao) descricao.textContent = item.descricao || '';
  if (imagem) {
    imagem.src = item.arquivo || '';
    imagem.alt = item.titulo;
  }

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Alterna o estado de favorito
 */
function toggleFavorito(itemId) {
  const index = favoritos.indexOf(itemId);
  
  if (index > -1) {
    favoritos.splice(index, 1);
    toasts.info('Removido dos favoritos');
  } else {
    favoritos.push(itemId);
    toasts.sucesso('Adicionado aos favoritos');
  }
  
  // Salvar
  localStorage.setItem('biblioteca_favoritos', JSON.stringify(favoritos));
  appState.set('biblioteca.favoritos', favoritos);
  
  // Re-renderizar
  renderizarCatalogo();
  renderizarFavoritos();
}

/**
 * Carrega os favoritos do localStorage
 */
function carregarFavoritos() {
  try {
    const saved = localStorage.getItem('biblioteca_favoritos');
    favoritos = saved ? JSON.parse(saved) : [];
    appState.set('biblioteca.favoritos', favoritos);
  } catch (e) {
    favoritos = [];
  }
}

/**
 * Renderiza a secção de favoritos
 */
function renderizarFavoritos() {
  const grid = document.getElementById('favoritosGrid');
  if (!grid) return;

  const favoritosItens = catalogo.filter(item => favoritos.includes(item.id));

  if (favoritosItens.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:30px 0;color:var(--cor-texto-terciario);">
        <p>Nenhum conteúdo favorito ainda</p>
        <p style="font-size:13px;">Clique no <i class="fas fa-heart"></i> para guardar os seus conteúdos preferidos</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  favoritosItens.forEach(item => {
    const card = components.criarCardConteudo(item, (dados) => {
      abrirConteudo(dados);
    });
    // Marcar como favorito
    const favBtn = card.querySelector('.btn-favorito');
    favBtn?.classList.add('ativo');
    grid.appendChild(card);
  });
}

/**
 * Mostra mensagem de conteúdo bloqueado
 */
function mostrarConteudoBloqueado() {
  const banner = document.getElementById('upgradeBanner');
  const bloqueado = document.getElementById('conteudoBloqueado');
  
  if (banner) banner.classList.add('visivel');
  if (bloqueado) bloqueado.classList.add('visivel');
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Tabs
  const tabs = document.querySelectorAll('.biblioteca-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      appState.set('biblioteca.filtros.tipo', tab.dataset.tipo);
      renderizarCatalogo();
    });
  });

  // Filtros
  const filtros = document.querySelectorAll('.filtro-btn');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      appState.set('biblioteca.filtros.categoria', btn.dataset.categoria);
      renderizarCatalogo();
    });
  });

  // Busca
  const busca = document.getElementById('buscaConteudo');
  if (busca) {
    busca.addEventListener('input', () => {
      // Filtro por texto (client-side)
      // TODO: Implementar busca
    });
  }

  // Botão de busca
  const btnBuscar = document.getElementById('btnBuscar');
  if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
      renderizarCatalogo();
    });
  }

  // Fechar modais
  document.querySelectorAll('[data-modal-fechar]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modals.close(modal);
    });
  });
}

// Exportar
export const catalogo = {
  init,
  carregarCatalogo,
  renderizarCatalogo,
  toggleFavorito,
};