/**
 * posicoes.js — Gestão de Posições do Simulador
 * Teca Capital EdTech
 * 
 * Responsabilidade: Exibir e gerenciar as posições da carteira
 * do utilizador no simulador.
 */

import { appState } from '../state.js';
import { modals } from '../ui/modals.js';
import { toasts } from '../ui/toasts.js';

export function init() {
  // Atualizar posições iniciais
  const posicoes = appState.get('simulador.posicoes') || [];
  renderizarPosicoes(posicoes);

  // Inscrever para mudanças
  appState.subscribe('simulador.posicoes', (novasPosicoes) => {
    renderizarPosicoes(novasPosicoes);
    atualizarResumo(novasPosicoes);
  });

  console.log('Módulo de Posições inicializado');
}

/**
 * Renderiza a tabela de posições
 */
export function renderizarPosicoes(posicoes) {
  const tbody = document.getElementById('listaPosicoes');
  if (!tbody) return;

  if (!posicoes || posicoes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:30px 0;color:var(--cor-texto-secundario);">
          <i class="fas fa-box-open" style="font-size:24px;display:block;margin-bottom:8px;"></i>
          Nenhuma posição na carteira
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = posicoes.map(p => {
    const ganhoPerda = p.ganho_perda || 0;
    const ganhoPerdaClass = ganhoPerda >= 0 ? 'positivo' : 'negativo';
    const ganhoPerdaSymbol = ganhoPerda >= 0 ? '+' : '';

    return `
      <tr>
        <td>
          <div class="ticker">${p.ticker || p.ativo_id}</div>
          <div class="nome">${p.nome || p.ativo_id}</div>
        </td>
        <td class="numerico">${p.quantidade || 0}</td>
        <td class="numerico">${formatarMoeda(p.preco_medio, p.moeda)}</td>
        <td class="numerico">${formatarMoeda(p.preco_atual, p.moeda)}</td>
        <td class="numerico ${ganhoPerdaClass}">${ganhoPerdaSymbol}${ganhoPerda.toFixed(2)}%</td>
        <td class="acao">
          <button class="btn btn-sm btn-primario btn-vender" data-id="${p.id}">Vender</button>
        </td>
      </tr>
    `;
  }).join('');

  // Eventos dos botões
  tbody.querySelectorAll('.btn-vender').forEach(btn => {
    btn.addEventListener('click', () => {
      const posicao = posicoes.find(p => p.id === btn.dataset.id);
      if (posicao) {
        abrirModalVenda(posicao);
      }
    });
  });
}

/**
 * Atualiza o resumo de posições
 */
function atualizarResumo(posicoes) {
  const totalInvestido = document.getElementById('totalInvestido');
  const ganhoPerda = document.getElementById('ganhoPerda');

  if (!totalInvestido || !ganhoPerda) return;

  let total = 0;
  let totalGanho = 0;

  posicoes.forEach(p => {
    total += p.valor_investido || 0;
    if (p.ganho_perda) {
      totalGanho += (p.valor_investido || 0) * (p.ganho_perda / 100);
    }
  });

  const ganhoPerdaPct = total > 0 ? (totalGanho / total) * 100 : 0;
  const ganhoPerdaClass = ganhoPerdaPct >= 0 ? 'positivo' : 'negativo';
  const ganhoPerdaSymbol = ganhoPerdaPct >= 0 ? '+' : '';

  totalInvestido.textContent = formatarMoeda(total, 'AOA');
  ganhoPerda.textContent = `${ganhoPerdaSymbol}${ganhoPerdaPct.toFixed(2)}%`;
  ganhoPerda.className = ganhoPerdaClass;
}

/**
 * Abre modal de venda
 */
function abrirModalVenda(posicao) {
  modals.confirm(
    'Vender Posição',
    `Deseja vender ${posicao.quantidade} ${posicao.nome || posicao.ativo_id} ao preço de ${formatarMoeda(posicao.preco_atual, posicao.moeda)}?`,
    () => {
      toasts.info('Funcionalidade em desenvolvimento');
    }
  );
}

/**
 * Formatador de moeda
 */
function formatarMoeda(valor, moeda = 'AOA') {
  const symbols = {
    'AOA': 'Kz ',
    'USD': '$ ',
    'EUR': '€ ',
    'GBP': '£ ',
    'JPY': '¥ ',
    'CNY': '¥ ',
    'BRL': 'R$ ',
  };
  const symbol = symbols[moeda] || moeda + ' ';
  return `${symbol}${Number(valor).toFixed(2).replace('.', ',')}`;
}

// Exportar
export const posicoes = {
  init,
  renderizarPosicoes,
};