/**
 * biblioteca-audios.js — Lógica da Página de Áudios
 * Teca Capital EdTech
 * 
 * Responsabilidade: Carregar e exibir áudios do catálogo,
 * gerenciar player de áudio.
 */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';
import { components } from '../ui/components.js';

let catalogo = [];
let audioAtual = null;
let paginaAtual = 1;
const ITENS_POR_PAGINA = 12;

export function init() {
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  setupEvents();
  loadAudios();

  console.log('Página de Áudios carregada');
}

/**
 * Carrega áudios do catálogo
 */
async function loadAudios() {
  try {
    const response = await api.get('/biblioteca/catalogo?tipo=audio');
    catalogo = response.dados?.conteudos || [];

    const isPago = response.dados?.assinatura === 'pago';
    const banner = document.getElementById('upgradeBanner');
    if (banner) {
      banner.style.display = isPago ? 'none' : 'flex';
    }

    renderizarAudios();

  } catch (error) {
    console.error('Erro ao carregar áudios:', error);
    toasts.erro('Erro ao carregar áudios');
  }
}

/**
 * Renderiza os áudios na grid
 */
function renderizarAudios() {
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
        <i class="fas fa-headphones" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cor-texto-terciario);"></i>
        <h3>Nenhum áudio encontrado</h3>
        <p>Tente ajustar os filtros ou a busca</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  paginados.forEach(item => {
    const card = components.criarCardConteudo(item, (dados) => {
      abrirAudio(dados);
    });
    card.classList.add('card-audio');
    grid.appendChild(card);
  });
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
    audioAtual = audio;
    atualizarControlesAudio();
  }

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Atualiza os controles do player de áudio
 */
function atualizarControlesAudio() {
  const audio = audioAtual;
  if (!audio) return;

  const playBtn = document.getElementById('btnAudioPlay');
  const progresso = document.getElementById('audioProgresso');
  const tempo = document.getElementById('audioTempo');
  const volume = document.getElementById('audioVolume');

  if (playBtn) {
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playBtn.onclick = () => {
      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    };
  }

  if (progresso) {
    audio.ontimeupdate = () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      progresso.value = pct || 0;
      if (tempo) {
        tempo.textContent = `${formatarTempo(audio.currentTime)} / ${formatarTempo(audio.duration)}`;
      }
    };
    progresso.oninput = () => {
      const pct = parseFloat(progresso.value) / 100;
      audio.currentTime = pct * audio.duration;
    };
  }

  if (volume) {
    volume.oninput = () => {
      audio.volume = parseFloat(volume.value) / 100;
    };
  }
}

/**
 * Formata tempo para MM:SS
 */
function formatarTempo(segundos) {
  if (!segundos || isNaN(segundos)) return '0:00';
  const min = Math.floor(segundos / 60);
  const sec = Math.floor(segundos % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
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
      renderizarAudios();
    });
  });

  const busca = document.getElementById('buscaConteudo');
  if (busca) {
    busca.addEventListener('input', () => {
      paginaAtual = 1;
      renderizarAudios();
    });
  }

  const anterior = document.getElementById('paginaAnterior');
  const proximo = document.getElementById('paginaProxima');

  if (anterior) {
    anterior.addEventListener('click', () => {
      if (paginaAtual > 1) { paginaAtual--; renderizarAudios(); }
    });
  }

  if (proximo) {
    proximo.addEventListener('click', () => {
      paginaAtual++;
      renderizarAudios();
    });
  }

  document.querySelectorAll('[data-modal-fechar]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        if (audioAtual) {
          audioAtual.pause();
          audioAtual = null;
        }
        modals.close(modal);
      }
    });
  });
}

export default { init };