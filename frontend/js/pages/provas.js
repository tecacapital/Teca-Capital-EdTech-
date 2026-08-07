/**
 * provas.js — Lógica da Página de Provas
 * Teca Capital EdTech
 * 
 * Responsabilidade: Listar provas disponíveis, gerenciar
 * início de provas e navegação.
 */

import { auth } from '../auth.js';
import { api } from '../api.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';

export function init() {
  // Verificar autenticação
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  // Configurar eventos
  setupEvents();

  // Carregar provas
  loadProvas();

  console.log('Página de Provas carregada');
}

/**
 * Carrega a lista de provas
 */
async function loadProvas() {
  try {
    const response = await api.get('/provas');
    const provas = response.dados?.provas || [];

    const grid = document.getElementById('provasGrid');
    if (!grid) return;

    if (provas.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
          <i class="fas fa-clipboard-list" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cor-texto-terciario);"></i>
          <h3>Nenhuma prova disponível</h3>
          <p>Novas provas estarão disponíveis em breve</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = provas.map(p => `
      <div class="card card-prova" data-id="${p.id}">
        <div class="card-prova-header">
          <h3>${p.titulo}</h3>
          <span class="card-prova-nivel ${p.nivel}">${getNivelLabel(p.nivel)}</span>
        </div>
        <p class="card-prova-descricao">${p.descricao || ''}</p>
        <div class="card-prova-meta">
          <span><i class="fas fa-clock"></i> ${p.duracao_minutos || 30} min</span>
          <span><i class="fas fa-question-circle"></i> ${p.questoes_count || 0} questões</span>
          <span><i class="fas fa-star"></i> Mínimo: ${p.pontuacao_minima || 70}%</span>
        </div>
        <div class="card-prova-acoes">
          <button class="btn btn-primario btn-iniciar" data-id="${p.id}">Iniciar Prova</button>
        </div>
      </div>
    `).join('');

    // Eventos dos botões
    grid.querySelectorAll('.btn-iniciar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const provaId = btn.dataset.id;
        const prova = provas.find(p => p.id === provaId);
        if (prova) {
          abrirModalInicio(prova);
        }
      });
    });

  } catch (error) {
    console.error('Erro ao carregar provas:', error);
    toasts.erro('Erro ao carregar lista de provas');
  }
}

/**
 * Abre o modal de confirmação de início
 */
function abrirModalInicio(prova) {
  const modal = document.getElementById('modalIniciarProva');
  if (!modal) return;

  document.getElementById('provaTitulo').textContent = prova.titulo;
  document.getElementById('provaNivel').textContent = getNivelLabel(prova.nivel);
  document.getElementById('provaDuracao').textContent = prova.duracao_minutos || 30;
  document.getElementById('provaQuestoes').textContent = prova.questoes_count || 0;
  document.getElementById('provaMinima').textContent = prova.pontuacao_minima || 70;

  const btnConfirmar = document.getElementById('btnConfirmarInicio');
  btnConfirmar.dataset.provaId = prova.id;

  modals.setup(modal);
  modals.open(modal);
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Confirmar início da prova
  const btnConfirmar = document.getElementById('btnConfirmarInicio');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
      const provaId = btnConfirmar.dataset.provaId;
      modals.close(document.getElementById('modalIniciarProva'));
      window.location.href = `/pages/provas/iniciar-prova.html?id=${provaId}`;
    });
  }

  // Fechar modal
  document.querySelectorAll('[data-modal-fechar]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modals.close(modal);
    });
  });
}

/**
 * Obtém o label do nível
 */
function getNivelLabel(nivel) {
  const labels = {
    'iniciante': 'Iniciante',
    'intermediario': 'Intermediário',
    'avancado': 'Avançado',
  };
  return labels[nivel] || nivel;
}

// Exportar
export default { init };