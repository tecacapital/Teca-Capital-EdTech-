/**
 * dashboard.js — Orquestrador do Simulador (COMPLETO)
 * Teca Capital EdTech
 * 
 * Responsabilidade: Coordenar todos os módulos do simulador,
 * gerenciar o polling de estado e integrar gráficos.
 */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { appState } from '../state.js';
import { charts } from '../charts.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';

// Módulos internos
import { carteira } from './carteira.js';
import { mercados } from './mercados.js';
import { posicoes } from './posicoes.js';
import { noticias } from './noticias.js';
import { tempo } from './tempo.js';

// Estado do simulador
let ultimoTickId = 0;
let isPolling = false;
let pollingInterval = null;
let graficoPatrimonial = null;
let historicoPatrimonial = [];

/**
 * Inicializa o dashboard do simulador
 */
export async function init() {
  // Verificar autenticação
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  // Inicializar gráficos
  await charts.init();

  // Inicializar submódulos
  if (carteira.init) carteira.init();
  if (mercados.init) mercados.init();
  if (posicoes.init) posicoes.init();
  if (noticias.init) noticias.init();
  if (tempo.init) tempo.init();

  // Configurar eventos
  setupEvents();

  // Iniciar gráfico
  initGrafico();

  // Iniciar polling
  startPolling();

  // Carregar estado inicial
  await fetchEstado();

  // Configurar navegação mobile
  setupMobileNav();

  console.log('Simulador inicializado');
}

/**
 * Inicializa o gráfico de evolução patrimonial
 */
function initGrafico() {
  const container = document.getElementById('graficoPatrimonial');
  if (!container) return;

  // Dados iniciais (vazios)
  historicoPatrimonial = [];
  
  graficoPatrimonial = charts.criarGraficoLinha('graficoPatrimonial', {
    categorias: [],
    series: [
      {
        nome: 'Património Total',
        dados: [],
        cor: '#D6AE64',
      },
    ],
  }, {
    area: true,
    yAxis: {
      name: 'Valor (Kz)',
      nameTextStyle: { color: '#B0B0B0' },
    },
    xAxis: {
      name: 'Data',
      nameTextStyle: { color: '#B0B0B0' },
    },
  });

  // Observer para redimensionamento
  const resizeObserver = new ResizeObserver(() => {
    if (graficoPatrimonial) {
      graficoPatrimonial.resize();
    }
  });
  resizeObserver.observe(container);
}

/**
 * Atualiza o gráfico com novos dados
 */
function atualizarGrafico(patrimonio, data) {
  if (!graficoPatrimonial) return;

  // Adicionar ao histórico
  historicoPatrimonial.push({
    data: data || new Date(),
    valor: patrimonio || 0,
  });

  // Manter apenas últimos 100 pontos
  if (historicoPatrimonial.length > 100) {
    historicoPatrimonial.shift();
  }

  // Atualizar gráfico
  charts.atualizar('graficoPatrimonial', {
    categorias: historicoPatrimonial.map(h => 
      new Date(h.data).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
    ),
    series: [
      {
        nome: 'Património Total',
        dados: historicoPatrimonial.map(h => h.valor),
        cor: '#D6AE64',
      },
    ],
  }, {
    area: true,
  });
}

/**
 * Inicia o polling de estado
 */
function startPolling() {
  if (isPolling) return;

  isPolling = true;
  pollingInterval = setInterval(fetchEstado, 5000);
  console.log('Polling iniciado (5s)');
}

/**
 * Para o polling
 */
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  isPolling = false;
}

/**
 * Busca o estado atual do simulador
 */
async function fetchEstado() {
  try {
    const response = await api.get(`/simulador/estado?desde=${ultimoTickId}`);
    
    if (response.dados) {
      const { tickId, dataSimulada, ativos, carteira, posicoes, noticias, sentimento } = response.dados;
      
      // Atualizar tick
      if (tickId > ultimoTickId) {
        ultimoTickId = tickId;
        
        // Atualizar data
        if (dataSimulada) {
          appState.set('simulador.dataSimulada', dataSimulada);
          tempo.atualizarRelogio(dataSimulada);
        }

        // Atualizar sentimento
        if (sentimento !== undefined) {
          appState.set('simulador.sentimento', sentimento);
        }

        // Atualizar carteira
        if (carteira) {
          appState.set('simulador.saldoRenda', carteira.renda || 0);
          appState.set('simulador.saldoInvestimento', carteira.investimento || 0);
          carteira.atualizar(carteira);
        }

        // Atualizar ativos (preços)
        if (ativos) {
          const ativosArray = Object.values(ativos);
          appState.set('simulador.ativos', ativosArray);
          mercados.atualizar(ativosArray);
        }

        // Atualizar posições
        if (posicoes) {
          appState.set('simulador.posicoes', posicoes);
          posicoes.renderizarPosicoes(posicoes);
        }

        // Atualizar notícias
        if (noticias) {
          appState.set('simulador.noticias', noticias);
          noticias.renderizarNoticias(noticias);
        }

        // Calcular e atualizar património total
        const totalPatrimonio = (carteira?.renda || 0) + (carteira?.investimento || 0);
        atualizarGrafico(totalPatrimonio, dataSimulada);
      }
    }
  } catch (error) {
    // Erro silencioso no polling
    if (error.status === 401) {
      stopPolling();
      auth.logout();
    }
  }
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Reset da simulação
  const btnReset = document.getElementById('btnResetSimulador');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      modals.confirm(
        'Reiniciar Simulação',
        'Tem certeza que deseja reiniciar a simulação? Todas as suas posições e histórico serão perdidos.',
        async () => {
          try {
            await api.post('/simulador/reset');
            toasts.sucesso('Simulação reiniciada!');
            window.location.reload();
          } catch (error) {
            toasts.erro('Erro ao reiniciar simulação');
          }
        }
      );
    });
  }

  // Perfil
  const btnPerfil = document.getElementById('btnPerfil');
  if (btnPerfil) {
    btnPerfil.addEventListener('click', () => {
      window.location.href = '/perfil.html';
    });
  }

  // Transferência entre carteiras
  const btnTransferir = document.getElementById('btnTransferir');
  if (btnTransferir) {
    btnTransferir.addEventListener('click', () => {
      abrirModalTransferencia();
    });
  }

  // Crédito
  const btnCredito = document.getElementById('btnCredito');
  if (btnCredito) {
    btnCredito.addEventListener('click', () => {
      abrirModalCredito();
    });
  }

  // Filtros do gráfico
  document.querySelectorAll('.grafico-filtros .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.grafico-filtros .btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // TODO: Filtrar gráfico por período
    });
  });

  // Transação (comprar/vender) - via modal
  setupModalTransacao();
}

/**
 * Configura o modal de transação
 */
function setupModalTransacao() {
  const modal = document.getElementById('modalTransacao');
  if (!modal) return;

  const btnConfirmar = document.getElementById('btnConfirmarTransacao');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
      const quantidade = parseInt(document.getElementById('transacaoQuantidade')?.value || 0);
      const ativoId = modal.dataset.ativoId;
      const tipo = modal.dataset.tipo;

      if (!ativoId || !tipo || quantidade <= 0) {
        toasts.erro('Dados inválidos');
        return;
      }

      try {
        const response = await api.post('/simulador/transacao', {
          ativoId,
          tipo,
          quantidade,
        });

        if (response.sucesso) {
          toasts.sucesso(tipo === 'comprar' ? 'Compra realizada!' : 'Venda realizada!');
          modals.close(modal);
          await fetchEstado();
        }
      } catch (error) {
        toasts.erro(error.message || 'Erro na transação');
      }
    });
  }

  // Fechar modal
  modal.querySelectorAll('[data-modal-fechar]').forEach(btn => {
    btn.addEventListener('click', () => {
      modals.close(modal);
    });
  });
}

/**
 * Abre modal de transferência
 */
function abrirModalTransferencia() {
  // TODO: Implementar modal de transferência
  modals.confirm(
    'Transferir',
    'Deseja transferir da Carteira de Renda para a Carteira de Investimento?',
    async () => {
      try {
        // TODO: Implementar transferência
        toasts.info('Funcionalidade em desenvolvimento');
      } catch (error) {
        toasts.erro('Erro na transferência');
      }
    }
  );
}

/**
 * Abre modal de crédito
 */
function abrirModalCredito() {
  // TODO: Implementar modal de crédito
  modals.confirm(
    'Solicitar Crédito',
    'Deseja solicitar um crédito bancário?',
    async () => {
      try {
        // TODO: Implementar crédito
        toasts.info('Funcionalidade em desenvolvimento');
      } catch (error) {
        toasts.erro('Erro ao solicitar crédito');
      }
    }
  );
}

/**
 * Configura navegação mobile (abas inferiores)
 */
function setupMobileNav() {
  const items = document.querySelectorAll('.nav-mobile-item');
  const paineis = {
    carteira: document.querySelector('.painel-carteira'),
    mercado: document.querySelector('.painel-mercado'),
    noticias: document.querySelector('.painel-noticias'),
    historico: document.querySelector('.painel-historico'),
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const target = item.dataset.painel;
      if (target) {
        const allPanels = document.querySelectorAll('.painel');
        allPanels.forEach(p => {
          if (window.innerWidth < 768) {
            p.style.display = 'none';
          }
        });

        const targetPanel = paineis[target];
        if (targetPanel) {
          targetPanel.style.display = '';
        }
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      document.querySelectorAll('.painel').forEach(p => {
        p.style.display = '';
      });
    }
  });
}

// Exportar
export const dashboard = {
  init,
  startPolling,
  stopPolling,
  fetchEstado,
};