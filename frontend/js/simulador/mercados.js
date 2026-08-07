/**
 * mercados.js — Tabela de Ativos e Preços (COMPLETO)
 * Teca Capital EdTech
 * 
 * Responsabilidade: Renderizar e atualizar a lista de ativos
 * disponíveis no mercado, com busca e filtros.
 */

import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';

let ativosCache = [];
let filtroAtual = 'todos';

/**
 * Inicializa o módulo de mercados
 */
export function init() {
  // Configurar busca
  const busca = document.getElementById('buscaAtivos');
  if (busca) {
    busca.addEventListener('input', () => {
      filtrarAtivos();
    });
  }

  // Configurar filtro de mercado
  const filtro = document.getElementById('filtroMercado');
  if (filtro) {
    filtro.addEventListener('change', () => {
      filtroAtual = filtro.value;
      filtrarAtivos();
    });
  }

  // Configurar modal de transação
  setupModalTransacao();
}

/**
 * Atualiza a lista de ativos
 */
export function atualizar(precos) {
  if (!precos || !Array.isArray(precos)) return;
  
  ativosCache = precos;
  renderizarAtivos();
}

/**
 * Renderiza a tabela de ativos
 */
function renderizarAtivos() {
  const container = document.getElementById('listaAtivos');
  if (!container) return;

  const ativosFiltrados = getAtivosFiltrados();
  
  if (ativosFiltrados.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
          <i class="fas fa-search" style="font-size:24px;display:block;margin-bottom:8px;"></i>
          Nenhum ativo encontrado
        </td>
      </tr>
    `;
    return;
  }

  const tbody = document.createElement('tbody');
  
  ativosFiltrados.forEach(ativo => {
    const tr = document.createElement('tr');
    
    const variacao = ativo.variacao || 0;
    const variacaoClass = variacao >= 0 ? 'positivo' : 'negativo';
    const variacaoSymbol = variacao >= 0 ? '+' : '';

    tr.innerHTML = `
      <td>
        <div class="ticker">${ativo.ticker || ativo.id}</div>
        <div class="nome">${ativo.nome || ativo.id}</div>
      </td>
      <td class="numerico preco">${formatarPreco(ativo.preco, ativo.moeda)}</td>
      <td class="numerico variacao ${variacaoClass}">${variacaoSymbol}${variacao.toFixed(2)}%</td>
      <td class="numerico volume">${formatarVolume(ativo.volume)}</td>
      <td class="acao">
        <button class="btn btn-sm btn-primario btn-comprar" data-id="${ativo.id}">Comprar</button>
        <button class="btn btn-sm btn-secundario btn-vender" data-id="${ativo.id}">Vender</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  container.innerHTML = '';
  container.appendChild(tbody);

  // Eventos dos botões
  container.querySelectorAll('.btn-comprar').forEach(btn => {
    btn.addEventListener('click', () => abrirTransacao('comprar', btn.dataset.id));
  });
  container.querySelectorAll('.btn-vender').forEach(btn => {
    btn.addEventListener('click', () => abrirTransacao('vender', btn.dataset.id));
  });
}

/**
 * Filtra ativos por busca e mercado
 */
function getAtivosFiltrados() {
  const busca = document.getElementById('buscaAtivos')?.value?.toLowerCase() || '';
  const filtroMercado = document.getElementById('filtroMercado')?.value || 'todos';

  return ativosCache.filter(ativo => {
    // Filtro de mercado
    if (filtroMercado !== 'todos') {
      const pais = (ativo.pais || '').toLowerCase();
      if (pais !== filtroMercado) return false;
    }

    // Filtro de busca
    if (busca) {
      const nome = (ativo.nome || '').toLowerCase();
      const ticker = (ativo.ticker || '').toLowerCase();
      const id = (ativo.id || '').toLowerCase();
      if (!nome.includes(busca) && !ticker.includes(busca) && !id.includes(busca)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Filtra ativos (trigger da UI)
 */
function filtrarAtivos() {
  renderizarAtivos();
}

/**
 * Abre o modal de transação
 */
function abrirTransacao(tipo, ativoId) {
  const ativo = ativosCache.find(a => a.id === ativoId);
  if (!ativo) {
    toasts.erro('Ativo não encontrado');
    return;
  }

  // Verificar se o ativo está disponível para o plano do utilizador
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  if (ativo.pais && ativo.pais !== 'Angola' && ativo.pais !== 'Brasil' && user.status_assinatura !== 'pago') {
    toasts.erro('Este ativo requer uma conta paga');
    return;
  }

  // Abrir modal de transação
  const modal = document.getElementById('modalTransacao');
  if (!modal) return;

  modal.dataset.ativoId = ativoId;
  modal.dataset.tipo = tipo;

  document.getElementById('modalTransacaoTitulo').textContent = tipo === 'comprar' ? 'Comprar' : 'Vender';
  document.getElementById('transacaoAtivoNome').textContent = `${ativo.nome} (${ativo.ticker})`;
  document.getElementById('transacaoAtivoPreco').textContent = formatarPreco(ativo.preco, ativo.moeda);
  document.getElementById('transacaoQuantidade').value = 1;
  document.getElementById('transacaoTotal').textContent = formatarPreco(ativo.preco, ativo.moeda);

  modals.setup(modal);
  modals.open(modal);

  // Atualizar total ao mudar quantidade
  const qtdInput = document.getElementById('transacaoQuantidade');
  qtdInput.oninput = () => {
    const qtd = parseInt(qtdInput.value) || 0;
    const total = ativo.preco * qtd;
    document.getElementById('transacaoTotal').textContent = formatarPreco(total, ativo.moeda);
  };
}

/**
 * Configura o modal de transação (eventos globais)
 */
function setupModalTransacao() {
  const modal = document.getElementById('modalTransacao');
  if (!modal) return;

  // Fechar modal
  modal.querySelectorAll('[data-modal-fechar]').forEach(btn => {
    btn.addEventListener('click', () => {
      modals.close(modal);
    });
  });
}

/**
 * Formatadores
 */
function formatarPreco(preco, moeda = 'AOA') {
  if (preco === undefined || preco === null) return '0,00';
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
  return `${symbol}${Number(preco).toFixed(2).replace('.', ',')}`;
}

function formatarVolume(volume) {
  if (!volume) return '0';
  if (volume >= 1000000000) return (volume / 1000000000).toFixed(1) + 'B';
  if (volume >= 1000000) return (volume / 1000000).toFixed(1) + 'M';
  if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K';
  return volume.toString();
}

// Exportar
export const mercados = {
  init,
  atualizar,
  filtrarAtivos,
};