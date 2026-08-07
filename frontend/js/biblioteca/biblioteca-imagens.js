/**
 * biblioteca-imagens.js — Lógica da Página de Infográficos
 * Teca Capital EdTech
 * 
 * Responsabilidade: Carregar e exibir imagens/infográficos
 * do catálogo.
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
  loadImagens();

  console.log('Página de Infográficos carregada');
}

/**
 * Carrega imagens do catálogo
 */
async function loadImagens() {
  try {
    const response = await api.get('/biblioteca/catalogo?tipo=imagem');
    catalogo = response.dados?.conteudos || [];

    const isPago = response.dados?.assinatura === 'pago';
    const banner = document.getElementById('upgradeBanner');
    if (banner) {
      banner.style.display = isPago ? 'none' : 'flex';
    }

    renderizarImagens();

  } catch (error) {
    console.error('Erro ao carregar infográficos:', error);
    toasts.erro('Erro ao carregar infográficos');
  }
}

/**
 * Renderiza as imagens na grid
 */
function renderizarImagens() {
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
        <i class="fas fa-image" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cor-texto-terciario);"></i>
        <h3>Nenhum infográfico encontrado</h3>
        <p>Tente ajustar os filtros ou a busca</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  paginados.forEach(item => {
    const card = components.criarCardConteudo(item, (dados) => {
      abrirImagem(dados);
    });
    card.classList.add('card-imagem');
    grid.appendChild(card);
  });
}

/**
 * Abre uma imagem no modal
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
      renderizarImagens();
    });
  });

  const busca = document.getElementById('buscaConteudo');
  if (busca) {
    busca.addEventListener('input', () => {
      paginaAtual = 1;
      renderizarImagens();
    });
  }

  const anterior = document.getElementById('paginaAnterior');
  const proximo = document.getElementById('paginaProxima');

  if (anterior) {
    anterior.addEventListener('click', () => {
      if (paginaAtual > 1) { paginaAtual--; renderizarImagens(); }
    });
  }

  if (proximo) {
    proximo.addEventListener('click', () => {
      paginaAtual++;
      renderizarImagens();
    });
  }
}

export default { init };