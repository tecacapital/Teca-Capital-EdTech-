/**
 * funcionario.js — Lógica do Painel do Funcionário
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar a fila de verificação de pagamentos
 * e busca de utilizadores.
 */

import { auth } from '../auth.js';
import { api } from '../api.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';

export function init() {
  // Verificar permissão de funcionário
  if (!auth.isAuthenticated || !['admin', 'funcionario'].includes(auth.user?.role)) {
    window.location.href = '/login.html';
    return;
  }

  // Configurar navegação do sidebar
  setupSidebarNavigation();

  // Carregar dados iniciais
  loadPagamentos();

  // Configurar eventos
  setupEvents();

  console.log('Painel do Funcionário carregado');
}

/**
 * Configura navegação do sidebar
 */
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.funcionario-nav-item');
  const sections = {
    pagamentos: document.getElementById('section-pagamentos'),
    usuarios: document.getElementById('section-usuarios'),
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const section = item.dataset.section;
      Object.entries(sections).forEach(([key, el]) => {
        if (el) {
          el.classList.toggle('active', key === section);
        }
      });

      switch (section) {
        case 'pagamentos':
          loadPagamentos();
          break;
        case 'usuarios':
          break;
      }
    });
  });
}

/**
 * Carrega pagamentos pendentes
 */
async function loadPagamentos() {
  try {
    const response = await api.get('/funcionario/pagamentos/pendentes');
    const pagamentos = response.dados?.pagamentos || [];

    const tbody = document.getElementById('listaPagamentos');
    if (!tbody) return;

    // Atualizar badge
    const badge = document.querySelector('.funcionario-nav-item .badge');
    if (badge) {
      badge.textContent = pagamentos.length || 0;
    }

    if (pagamentos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
            <i class="fas fa-check-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i>
            Nenhum pagamento pendente
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pagamentos.map(p => `
      <tr>
        <td>${p.usuario_nome || '—'}</td>
        <td>${p.plano || '—'}</td>
        <td class="numerico">${formatarMoeda(p.valor, 'AOA')}</td>
        <td>${formatarData(p.criado_em)}</td>
        <td>
          <a href="${p.comprovativo_url || '#'}" target="_blank" class="btn btn-sm btn-texto">
            <i class="fas fa-file-image"></i> Ver
          </a>
        </td>
        <td>
          <button class="btn btn-sm btn-sucesso btn-aprovar" data-id="${p.id}">Aprovar</button>
          <button class="btn btn-sm btn-perigo btn-rejeitar" data-id="${p.id}">Rejeitar</button>
        </td>
      </tr>
    `).join('');

    // Eventos dos botões
    tbody.querySelectorAll('.btn-aprovar').forEach(btn => {
      btn.addEventListener('click', () => {
        modals.confirm(
          'Aprovar Pagamento',
          'Tem certeza que deseja aprovar este pagamento?',
          async () => {
            try {
              await api.patch(`/funcionario/pagamentos/${btn.dataset.id}/aprovar`);
              toasts.sucesso('Pagamento aprovado');
              loadPagamentos();
            } catch (error) {
              toasts.erro('Erro ao aprovar pagamento');
            }
          }
        );
      });
    });

    tbody.querySelectorAll('.btn-rejeitar').forEach(btn => {
      btn.addEventListener('click', () => {
        const justificativa = prompt('Motivo da rejeição:');
        if (justificativa === null) return;

        modals.confirm(
          'Rejeitar Pagamento',
          `Tem certeza que deseja rejeitar este pagamento?<br><br><strong>Motivo:</strong> ${justificativa}`,
          async () => {
            try {
              await api.patch(`/funcionario/pagamentos/${btn.dataset.id}/rejeitar`, { justificativa });
              toasts.sucesso('Pagamento rejeitado');
              loadPagamentos();
            } catch (error) {
              toasts.erro('Erro ao rejeitar pagamento');
            }
          }
        );
      });
    });

  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    toasts.erro('Erro ao carregar pagamentos pendentes');
  }
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Busca de utilizadores
  const btnBuscar = document.getElementById('btnBuscarUsuarios');
  const busca = document.getElementById('buscaUsuarios');

  if (btnBuscar && busca) {
    btnBuscar.addEventListener('click', buscarUsuarios);
    busca.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        buscarUsuarios();
      }
    });
  }
}

/**
 * Busca utilizadores
 */
async function buscarUsuarios() {
  const termo = document.getElementById('buscaUsuarios')?.value;

  if (!termo || termo.length < 2) {
    toasts.alerta('Digite pelo menos 2 caracteres para buscar');
    return;
  }

  try {
    const response = await api.get(`/funcionario/usuarios/buscar?termo=${encodeURIComponent(termo)}`);
    const usuarios = response.dados?.usuarios || [];

    const tbody = document.getElementById('listaUsuarios');
    if (!tbody) return;

    if (usuarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
            <i class="fas fa-search" style="font-size:24px;display:block;margin-bottom:8px;"></i>
            Nenhum utilizador encontrado
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td>${u.nome || '—'}</td>
        <td>${u.email || '—'}</td>
        <td>${u.tipo_usuario || 'individual'}</td>
        <td><span class="badge ${u.status_assinatura === 'pago' ? 'badge-success' : 'badge-secondary'}">${u.status_assinatura || 'gratuito'}</span></td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error);
    toasts.erro('Erro ao buscar utilizadores');
  }
}

/**
 * Formatadores
 */
function formatarMoeda(valor, moeda = 'AOA') {
  const symbols = {
    'AOA': 'Kz ',
    'USD': '$ ',
    'EUR': '€ ',
  };
  const symbol = symbols[moeda] || moeda + ' ';
  return `${symbol}${Number(valor).toFixed(2).replace('.', ',')}`;
}

function formatarData(data) {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Exportar
export default { init };