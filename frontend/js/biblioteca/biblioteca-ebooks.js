/**
 * biblioteca-ebooks.js — Lógica da Página de E-books
 * Teca Capital EdTech
 * 
 * Responsabilidade: Carregar e exibir e-books do catálogo,
 * gerenciar downloads e visualização.
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
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  setupEvents();
  loadEbooks();

  console.log('Página de E-books carregada');
}

/**
 * Carrega e-books do catálogo
 */
async function loadEbooks() {
  try {
    const response = await api.get('/biblioteca/catalogo?tipo=ebook');
    catalogo = response.dados?.conteudos || [];

    const isPago = response.dados?.assinatura === 'pago';
    const banner = document.getElementById('upgradeBanner');
    if (banner) {
      banner.style.display = isPago ? 'none' : 'flex';
    }

    renderizarEbooks();

  } catch (error) {
    console.error('Erro ao carregar e-books:', error);
    toasts.erro('Erro ao carregar e-books');
  }
}

/**
 * Renderiza os e-books na grid
 */
function renderizarEbooks() {
  const grid = document.getElementById('bibliotecaGrid');
  if (!grid) return;

  const filtros = getFiltros();
  const busca = document.getElementById('buscaConteudo')?.value?.toLowerCase() || '';

  let filtrados = catalogo.filter(item => {
    if (filtros.categoria !== 'todos' && item.categoria !== filtros.categoria) return false;
    if (busca) {
      const titulo = (item.titulo || '').toLowerCase();
      const desc = (item.descricao || '').toLowerCase();
      if (!titulo.includes(busca) && !desc.includes(busca)) return false;
    }
    return true;
  });

  const totalPaginas = Math.ceil(filtrados.length / ITENS_POR_PAGINA);
  const start = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const end = start + ITENS_POR_PAGINA;
  const paginados = filtrados.slice(start, end);

  atualizarPaginacao(totalPaginas);

  if (paginados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--cor-texto-secundario);">
        <i class="fas fa-book" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cor-texto-terciario);"></i>
        <h3>Nenhum e-book encontrado</h3>
        <p>Tente ajustar os filtros ou a busca</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  paginados.forEach(item => {
    const card = components.criarCardConteudo(item, (dados) => {
      abrirEbook(dados);
    });
    card.classList.add('card-ebook');
    grid.appendChild(card);
  });
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

function getFiltros() {
  const categoria = document.querySelector('.filtro-btn.active')?.dataset.categoria || 'todos';
  return { categoria };
}

function atualizarPaginacao(totalPaginas) {
  const info = document.getElementById('paginaInfo');
  const anterior = document.getElementById('paginaAnterior');
  const proximo = document.getElementById('paginaProxima');

  if (info) info.textContent = `Página ${paginaAtual} de ${totalPaginas || 1}`;
  if (anterior) anterior.disabled = paginaAtual <= 1;
  if (proximo) proximo.disabled = paginaAtual >= totalPaginas;
}

function setupEvents() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      paginaAtual = 1;
      renderizarEbooks();
    });
  });

  const busca = document.getElementById('buscaConteudo');
  if (busca) {
    busca.addEventListener('input', () => {
      paginaAtual = 1;
      renderizarEbooks();
    });
  }

  const anterior = document.getElementById('paginaAnterior');
  const proximo = document.getElementById('paginaProxima');

  if (anterior) {
    anterior.addEventListener('click', () => {
      if (paginaAtual > 1) { paginaAtual--; renderizarEbooks(); }
    });
  }

  if (proximo) {
    proximo.addEventListener('click', () => {
      paginaAtual++;
      renderizarEbooks();
    });
  }

  // Favoritar e-book
  const btnFavoritar = document.getElementById('btnFavoritarEbook');
  if (btnFavoritar) {
    btnFavoritar.addEventListener('click', () => {
      toasts.info('Funcionalidade em desenvolvimento');
    });
  }
}

export default { init };