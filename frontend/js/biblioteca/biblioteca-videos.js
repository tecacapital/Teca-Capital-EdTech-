/**
 * biblioteca-videos.js — Lógica da Página de Vídeos
 * Teca Capital EdTech
 * 
 * Responsabilidade: Carregar e exibir vídeos do catálogo,
 * gerenciar filtros, busca e player.
 */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';
import { components } from '../ui/components.js';

let catalogo = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 12;

export function init() {
  // Verificar autenticação
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  // Configurar eventos
  setupEvents();

  // Carregar vídeos
  loadVideos();

  console.log('Página de Vídeos carregada');
}

/**
 * Carrega vídeos do catálogo
 */
async function loadVideos() {
  try {
    const response = await api.get('/biblioteca/catalogo?tipo=video');
    catalogo = response.dados?.conteudos || [];

    // Verificar se é pago
    const isPago = response.dados?.assinatura === 'pago';
    const banner = document.getElementById('upgradeBanner');
    if (banner) {
      banner.style.display = isPago ? 'none' : 'flex';
    }

    renderizarVideos();

  } catch (error) {
    console.error('Erro ao carregar vídeos:', error);
    toasts.erro('Erro ao carregar vídeos');
  }
}

/**
 * Renderiza os vídeos na grid
 */
function renderizarVideos() {
  const grid = document.getElementById('bibliotecaGrid');
  if (!grid) return;

  const filtros = getFiltros();
  const busca = document.getElementById('buscaConteudo')?.value?.toLowerCase() || '';

  let filtrados = catalogo.filter(item => {
    // Filtro de categoria
    if (filtros.categoria !== 'todos' && item.categoria !== filtros.categoria) return false;
    
    // Filtro de busca
    if (busca) {
      const titulo = (item.titulo || '').toLowerCase();
      const desc = (item.descricao || '').toLowerCase();
      if (!titulo.includes(busca) && !desc.includes(busca)) return false;
    }
    
    return true;
  });

  // Paginação
  const totalPaginas = Math.ceil(filtrados.length / ITENS_POR_PAGINA);
  const start = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const end = start + ITENS_POR_PAGINA;
  const paginados = filtrados.slice(start, end);

  // Atualizar paginação
  atualizarPaginacao(totalPaginas);

  if (paginados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--cor-texto-secundario);">
        <i class="fas fa-video" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cor-texto-terciario);"></i>
        <h3>Nenhum vídeo encontrado</h3>
        <p>Tente ajustar os filtros ou a busca</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  paginados.forEach(item => {
    const card = components.criarCardConteudo(item, (dados) => {
      abrirVideo(dados);
    });
    
    // Adicionar classe específica para vídeos
    card.classList.add('card-video');
    
    grid.appendChild(card);
  });
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
    video.play().catch(() => {});
  }

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Obtém os filtros atuais
 */
function getFiltros() {
  const categoria = document.querySelector('.filtro-btn.active')?.dataset.categoria || 'todos';
  return { categoria };
}

/**
 * Atualiza a paginação
 */
function atualizarPaginacao(totalPaginas) {
  const info = document.getElementById('paginaInfo');
  const anterior = document.getElementById('paginaAnterior');
  const proximo = document.getElementById('paginaProxima');

  if (info) {
    info.textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
  }

  if (anterior) {
    anterior.disabled = paginaAtual <= 1;
  }

  if (proximo) {
    proximo.disabled = paginaAtual >= totalPaginas;
  }
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Filtros de categoria
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      paginaAtual = 1;
      renderizarVideos();
    });
  });

  // Busca
  const busca = document.getElementById('buscaConteudo');
  if (busca) {
    busca.addEventListener('input', () => {
      paginaAtual = 1;
      renderizarVideos();
    });
  }

  // Botão de busca
  const btnBuscar = document.getElementById('btnBuscar');
  if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
      paginaAtual = 1;
      renderizarVideos();
    });
  }

  // Paginação
  const anterior = document.getElementById('paginaAnterior');
  const proximo = document.getElementById('paginaProxima');

  if (anterior) {
    anterior.addEventListener('click', () => {
      if (paginaAtual > 1) {
        paginaAtual--;
        renderizarVideos();
      }
    });
  }

  if (proximo) {
    proximo.addEventListener('click', () => {
      paginaAtual++;
      renderizarVideos();
    });
  }

  // Fechar modal
  document.querySelectorAll('[data-modal-fechar]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        const video = modal.querySelector('video');
        if (video) {
          video.pause();
          video.src = '';
        }
        modals.close(modal);
      }
    });
  });

  // Favoritar vídeo
  const btnFavoritar = document.getElementById('btnFavoritarVideo');
  if (btnFavoritar) {
    btnFavoritar.addEventListener('click', () => {
      toasts.info('Funcionalidade em desenvolvimento');
    });
  }
}

// Exportar
export default { init };