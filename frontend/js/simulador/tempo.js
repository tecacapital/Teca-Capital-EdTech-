/**
 * tempo.js — Controlo de Velocidade e Relógio Visual
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar a velocidade da simulação e
 * atualizar o relógio visual.
 */

import { api } from '../api.js';
import { appState } from '../state.js';
import { toasts } from '../ui/toasts.js';

let velocidadeAtual = appState.get('simulador.velocidade') || 1;

/**
 * Inicializa o módulo de tempo
 */
export function init() {
  // Configurar botões de velocidade
  const botoes = document.querySelectorAll('[data-velocidade]');
  
  botoes.forEach(btn => {
    const velocidade = parseInt(btn.dataset.velocidade);
    
    btn.addEventListener('click', () => {
      alterarVelocidade(velocidade);
    });

    // Destacar o ativo
    if (velocidade === velocidadeAtual) {
      btn.classList.add('active');
    }
  });

  // Atualizar relógio
  atualizarRelogio(appState.get('simulador.dataSimulada') || '2025-01-01');
  atualizarIndicador(velocidadeAtual);
}

/**
 * Altera a velocidade da simulação
 */
async function alterarVelocidade(novaVelocidade) {
  try {
    const response = await api.patch('/simulador/velocidade', { velocidade: novaVelocidade });
    
    if (response.sucesso) {
      velocidadeAtual = novaVelocidade;
      appState.set('simulador.velocidade', novaVelocidade);
      
      // Atualizar UI
      atualizarIndicador(novaVelocidade);
      
      // Atualizar data (se retornada)
      if (response.dados?.dataSimulada) {
        atualizarRelogio(response.dados.dataSimulada);
      }

      const labels = { 0: 'Pausa', 1: '1x', 3: '3x', 5: '5x', 10: '10x' };
      toasts.info(`Velocidade: ${labels[novaVelocidade] || novaVelocidade}`);
    }
  } catch (error) {
    toasts.erro('Erro ao alterar velocidade');
  }
}

/**
 * Atualiza o relógio visual
 */
export function atualizarRelogio(data) {
  const el = document.getElementById('dataSimulada');
  if (el) {
    const date = new Date(data);
    el.textContent = date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

/**
 * Atualiza o indicador de velocidade
 */
function atualizarIndicador(velocidade) {
  // Atualizar botões
  document.querySelectorAll('[data-velocidade]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.velocidade) === velocidade);
  });

  // Atualizar indicador no header
  const indicador = document.getElementById('velocidadeAtual');
  if (indicador) {
    const labels = { 0: '⏸', 1: '1x', 3: '3x', 5: '5x', 10: '10x' };
    indicador.textContent = labels[velocidade] || velocidade;
  }
}

// Exportar
export const tempo = {
  init,
  alterarVelocidade,
  atualizarRelogio,
};