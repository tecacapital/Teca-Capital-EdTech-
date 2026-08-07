/**
 * admin.js — Lógica do Painel Administrativo
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar o dashboard administrativo,
 * listagem de utilizadores, gestão de funcionários e parceiros,
 * verificação de pagamentos e auditoria.
 */

import { auth } from '../auth.js';
import { api } from '../api.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';
import { appState } from '../state.js';

export function init() {
  // Verificar permissão de admin
  if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
    window.location.href = '/login.html';
    return;
  }

  // Configurar navegação do sidebar
  setupSidebarNavigation();

  // Carregar dados iniciais
  loadDashboard();

  // Configurar eventos
  setupEvents();

  // Configurar modals
  setupModals();

  console.log('Painel Administrativo carregado');
}

/**
 * Configura navegação do sidebar
 */
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = {
    dashboard: document.getElementById('section-dashboard'),
    usuarios: document.getElementById('section-usuarios'),
    pagamentos: document.getElementById('section-pagamentos'),
    funcionarios: document.getElementById('section-funcionarios'),
    parceiros: document.getElementById('section-parceiros'),
    auditoria: document.getElementById('section-auditoria'),
    configuracoes: document.getElementById('section-configuracoes'),
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      // Atualizar navegação
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Mostrar secção correspondente
      const section = item.dataset.section;
      Object.entries(sections).forEach(([key, el]) => {
        if (el) {
          el.classList.toggle('active', key === section);
        }
      });

      // Carregar dados da secção
      switch (section) {
        case 'dashboard':
          loadDashboard();
          break;
        case 'usuarios':
          loadUsuarios();
          break;
        case 'pagamentos':
          loadPagamentos();
          break;
        case 'funcionarios':
          loadFuncionarios();
          break;
        case 'parceiros':
          loadParceiros();
          break;
        case 'auditoria':
          loadAuditoria();
          break;
        case 'configuracoes':
          loadConfiguracoes();
          break;
      }
    });
  });
}

/**
 * Carrega o dashboard
 */
async function loadDashboard() {
  try {
    const response = await api.get('/admin/dashboard');
    const data = response.dados || {};

    document.getElementById('statTotalUsers').textContent = data.totalUsers || 0;
    document.getElementById('statPagos').textContent = data.pagos || 0;
    document.getElementById('statPendentes').textContent = data.pendentes || 0;
    document.getElementById('statFuncionarios').textContent = data.funcionarios || 0;
    document.getElementById('statParceiros').textContent = data.parceiros || 0;

    // Atualizar badge de pagamentos pendentes
    const badge = document.querySelector('.admin-nav-item[data-section="pagamentos"] .badge');
    if (badge) {
      badge.textContent = data.pendentes || 0;
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

/**
 * Carrega lista de utilizadores
 */
async function loadUsuarios() {
  try {
    const search = document.getElementById('buscaUsuarios')?.value || '';
    const response = await api.get(`/admin/usuarios?search=${encodeURIComponent(search)}`);
    const usuarios = response.dados?.usuarios || [];

    const tbody = document.getElementById('listaUsuarios');
    if (!tbody) return;

    if (usuarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
            <i class="fas fa-users" style="font-size:24px;display:block;margin-bottom:8px;"></i>
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
        <td>
          <button class="btn btn-sm btn-texto btn-editar" data-id="${u.id}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-texto btn-remover" data-id="${u.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    // Eventos dos botões
    tbody.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        toasts.info('Funcionalidade em desenvolvimento');
      });
    });

    tbody.querySelectorAll('.btn-remover').forEach(btn => {
      btn.addEventListener('click', () => {
        modals.confirm(
          'Remover Utilizador',
          'Tem certeza que deseja remover este utilizador? Esta ação é irreversível.',
          async () => {
            try {
              await api.delete(`/admin/usuarios/${btn.dataset.id}`);
              toasts.sucesso('Utilizador removido com sucesso');
              loadUsuarios();
            } catch (error) {
              toasts.erro('Erro ao remover utilizador');
            }
          }
        );
      });
    });

  } catch (error) {
    console.error('Erro ao carregar utilizadores:', error);
    toasts.erro('Erro ao carregar lista de utilizadores');
  }
}

/**
 * Carrega pagamentos pendentes
 */
async function loadPagamentos() {
  try {
    const response = await api.get('/admin/pagamentos/pendentes');
    const pagamentos = response.dados?.pagamentos || [];

    const tbody = document.getElementById('listaPagamentos');
    if (!tbody) return;

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
          'Tem certeza que deseja aprovar este pagamento? O acesso do utilizador será liberado.',
          async () => {
            try {
              await api.patch(`/admin/pagamentos/${btn.dataset.id}/aprovar`);
              toasts.sucesso('Pagamento aprovado com sucesso');
              loadPagamentos();
              loadDashboard();
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
              await api.patch(`/admin/pagamentos/${btn.dataset.id}/rejeitar`, { justificativa });
              toasts.sucesso('Pagamento rejeitado');
              loadPagamentos();
              loadDashboard();
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
 * Carrega lista de funcionários
 */
async function loadFuncionarios() {
  try {
    const response = await api.get('/admin/funcionarios');
    const funcionarios = response.dados?.funcionarios || [];

    const tbody = document.getElementById('listaFuncionarios');
    if (!tbody) return;

    if (funcionarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
            <i class="fas fa-user-tie" style="font-size:24px;display:block;margin-bottom:8px;"></i>
            Nenhum funcionário cadastrado
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = funcionarios.map(f => `
      <tr>
        <td>${f.nome || '—'}</td>
        <td>${f.email || '—'}</td>
        <td>
          <button class="btn btn-sm btn-texto btn-remover-func" data-id="${f.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-remover-func').forEach(btn => {
      btn.addEventListener('click', () => {
        modals.confirm(
          'Remover Funcionário',
          'Tem certeza que deseja remover este funcionário?',
          async () => {
            try {
              await api.delete(`/admin/funcionarios/${btn.dataset.id}`);
              toasts.sucesso('Funcionário removido com sucesso');
              loadFuncionarios();
            } catch (error) {
              toasts.erro('Erro ao remover funcionário');
            }
          }
        );
      });
    });

  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
    toasts.erro('Erro ao carregar lista de funcionários');
  }
}

/**
 * Carrega parceiros
 */
async function loadParceiros() {
  try {
    const response = await api.get('/admin/parceiros');
    const parceiros = response.dados?.parceiros || [];

    const tbody = document.getElementById('listaParceiros');
    if (!tbody) return;

    if (parceiros.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
            <i class="fas fa-handshake" style="font-size:24px;display:block;margin-bottom:8px;"></i>
            Nenhum parceiro cadastrado
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = parceiros.map(p => `
      <tr>
        <td>${p.nome || '—'}</td>
        <td>${p.email || '—'}</td>
        <td>${p.tipo || '—'}</td>
        <td>
          <button class="btn btn-sm btn-texto btn-remover-parceiro" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-remover-parceiro').forEach(btn => {
      btn.addEventListener('click', () => {
        modals.confirm(
          'Remover Parceiro',
          'Tem certeza que deseja remover este parceiro?',
          async () => {
            try {
              await api.delete(`/admin/parceiros/${btn.dataset.id}`);
              toasts.sucesso('Parceiro removido com sucesso');
              loadParceiros();
            } catch (error) {
              toasts.erro('Erro ao remover parceiro');
            }
          }
        );
      });
    });

  } catch (error) {
    console.error('Erro ao carregar parceiros:', error);
    toasts.erro('Erro ao carregar lista de parceiros');
  }
}

/**
 * Carrega auditoria
 */
async function loadAuditoria() {
  try {
    const response = await api.get('/admin/auditoria');
    const auditoria = response.dados?.auditoria || [];

    const tbody = document.getElementById('listaAuditoria');
    if (!tbody) return;

    if (auditoria.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:40px 0;color:var(--cor-texto-secundario);">
            <i class="fas fa-clipboard-list" style="font-size:24px;display:block;margin-bottom:8px;"></i>
            Nenhum registo de auditoria
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = auditoria.map(a => `
      <tr>
        <td>${formatarData(a.criado_em)}</td>
        <td>${a.usuario_nome || a.usuario_id}</td>
        <td>${a.acao || '—'}</td>
        <td>${a.entidade || '—'}</td>
        <td>${a.detalhes || '—'}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar auditoria:', error);
    toasts.erro('Erro ao carregar auditoria');
  }
}

/**
 * Carrega configurações
 */
function loadConfiguracoes() {
  // TODO: Carregar configurações do backend
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Busca de utilizadores
  const busca = document.getElementById('buscaUsuarios');
  if (busca) {
    busca.addEventListener('input', () => {
      loadUsuarios();
    });
  }

  // Adicionar funcionário
  const btnAdicionar = document.getElementById('btnAdicionarFuncionario');
  if (btnAdicionar) {
    btnAdicionar.addEventListener('click', () => {
      modals.open(document.getElementById('modalFuncionario'));
    });
  }

  // Salvar funcionário
  const btnSalvar = document.getElementById('btnSalvarFuncionario');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', async () => {
      const nome = document.getElementById('funcNome')?.value;
      const email = document.getElementById('funcEmail')?.value;
      const senha = document.getElementById('funcPassword')?.value;

      if (!nome || !email || !senha) {
        toasts.erro('Preencha todos os campos');
        return;
      }

      try {
        await api.post('/admin/funcionarios', { nome, email, senha });
        toasts.sucesso('Funcionário adicionado com sucesso');
        modals.close(document.getElementById('modalFuncionario'));
        loadFuncionarios();
      } catch (error) {
        toasts.erro('Erro ao adicionar funcionário');
      }
    });
  }

  // Adicionar parceiro
  const btnAdicionarParceiro = document.getElementById('btnAdicionarParceiro');
  if (btnAdicionarParceiro) {
    btnAdicionarParceiro.addEventListener('click', () => {
      toasts.info('Funcionalidade em desenvolvimento');
    });
  }

  // Salvar configurações
  const btnSalvarConfig = document.getElementById('btnSalvarConfig');
  if (btnSalvarConfig) {
    btnSalvarConfig.addEventListener('click', () => {
      toasts.sucesso('Configurações salvas com sucesso');
    });
  }
}

/**
 * Configura modals
 */
function setupModals() {
  const modal = document.getElementById('modalFuncionario');
  if (modal) {
    modals.setup(modal);
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