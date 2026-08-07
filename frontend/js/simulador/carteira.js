/**
 * carteira.js — Gestão Visual da Carteira
 * Teca Capital EdTech
 * 
 * Responsabilidade: Atualizar a interface da carteira com
 * saldos, moedas e indicadores.
 */

import { appState } from '../state.js';

/**
 * Inicializa o módulo da carteira
 */
export function init() {
  // Atualizar saldos iniciais
  const saldoRenda = appState.get('simulador.saldoRenda') || 0;
  const saldoInvestimento = appState.get('simulador.saldoInvestimento') || 0;
  
  atualizarSaldos(saldoRenda, saldoInvestimento);
  atualizarMoedas([]);
}

/**
 * Atualiza os saldos da carteira
 */
export function atualizar(carteira) {
  const saldoRenda = carteira.renda || 0;
  const saldoInvestimento = carteira.investimento || 0;
  const moedas = carteira.moedas || [];
  
  atualizarSaldos(saldoRenda, saldoInvestimento);
  atualizarMoedas(moedas);
  atualizarTotal(saldoRenda, saldoInvestimento);
}

/**
 * Atualiza os saldos na UI
 */
function atualizarSaldos(renda, investimento) {
  const rendaEl = document.getElementById('saldoRenda');
  const investimentoEl = document.getElementById('saldoInvestimento');
  
  if (rendaEl) {
    rendaEl.textContent = formatarMoeda(renda, 'AOA');
  }
  
  if (investimentoEl) {
    investimentoEl.textContent = formatarMoeda(investimento, 'USD');
  }
}

/**
 * Atualiza as moedas disponíveis
 */
function atualizarMoedas(moedas) {
  const container = document.getElementById('carteiraMoedas');
  if (!container) return;

  if (!moedas || moedas.length === 0) {
    container.innerHTML = `
      <span class="carteira-moeda">AOA: 0,00</span>
      <span class="carteira-moeda">USD: 0,00</span>
    `;
    return;
  }

  container.innerHTML = moedas.map(m => `
    <span class="carteira-moeda">${m.codigo}: ${formatarMoeda(m.saldo, m.codigo)}</span>
  `).join('');
}

/**
 * Atualiza o total investido
 */
function atualizarTotal(renda, investimento) {
  const totalEl = document.getElementById('saldoTotal');
  if (totalEl) {
    totalEl.textContent = formatarMoeda(renda + investimento, 'AOA');
  }
}

/**
 * Formata um valor monetário
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
  const formatted = valor.toFixed(2).replace('.', ',');
  return `${symbol}${formatted}`;
}

// Exportar
export const carteira = {
  init,
  atualizar,
};