/**
 * perfil.js — Lógica da Página de Perfil do Utilizador
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar exibição e edição do perfil,
 * incluindo campos de país e província.
 */

import { auth } from '../auth.js';
import { api } from '../api.js';
import { toasts } from '../ui/toasts.js';
import { modals } from '../ui/modals.js';
import { appState } from '../state.js';

export function init() {
  // Verificar autenticação
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  // Carregar dados do utilizador
  carregarPerfil();

  // Configurar navegação do perfil
  setupProfileNavigation();

  // Configurar formulários
  setupForms();

  // Configurar eventos
  setupEvents();

  console.log('Página de Perfil carregada');
}

/**
 * Carrega os dados do perfil do utilizador
 */
function carregarPerfil() {
  const user = auth.user || JSON.parse(localStorage.getItem('user_data') || '{}');

  // Preencher dados na UI
  document.getElementById('perfilNome').textContent = user.nome || 'Utilizador';
  document.getElementById('perfilEmail').textContent = user.email || '—';
  document.getElementById('perfilNomeInput').value = user.nome || '';
  document.getElementById('perfilEmailInput').value = user.email || '';
  document.getElementById('perfilTelefone').value = user.telefone || '';

  // Campos de localização
  document.getElementById('perfilPais').value = user.pais || '';
  document.getElementById('perfilProvincia').value = user.provincia || '';

  // Status da assinatura
  const status = user.status_assinatura || 'gratuito';
  const badge = document.getElementById('perfilStatus');
  if (badge) {
    badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    badge.className = `perfil-badge ${status}`;
  }

  // Plano atual
  document.getElementById('planoAtual').textContent = status === 'pago' ? 'Pago' : 'Gratuito';
  document.getElementById('statusAssinatura').textContent = status === 'pago' ? 'Ativo' : '—';
  document.getElementById('proximaRenovacao').textContent = user.data_expiracao ? new Date(user.data_expiracao).toLocaleDateString('pt-PT') : '—';

  // Renda mensal
  const renda = user.renda_mensal || 0;
  document.getElementById('rendaMensal').textContent = formatarMoeda(renda, 'AOA');

  // Lotes empresariais (se for empresa)
  if (user.tipo_usuario === 'empresa') {
    document.getElementById('lotesContratados').textContent = user.lotes_contratados || 0;
    document.getElementById('subutilizadoresMaximos').textContent = user.subutilizadores_maximos || 0;
  }
}

/**
 * Configura a navegação do perfil (tabs)
 */
function setupProfileNavigation() {
  const navItems = document.querySelectorAll('.perfil-nav-item');
  const sections = {
    dados: document.getElementById('section-dados'),
    assinatura: document.getElementById('section-assinatura'),
    simulador: document.getElementById('section-simulador'),
    seguranca: document.getElementById('section-seguranca'),
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
    });
  });
}

/**
 * Configura os formulários do perfil
 */
function setupForms() {
  // Formulário de dados pessoais
  const formDados = document.getElementById('formDadosPessoais');
  if (formDados) {
    formDados.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = document.getElementById('perfilNomeInput')?.value;
      const telefone = document.getElementById('perfilTelefone')?.value;
      const pais = document.getElementById('perfilPais')?.value;
      const provincia = document.getElementById('perfilProvincia')?.value;

      if (!nome) {
        toasts.erro('O nome é obrigatório');
        return;
      }

      const btn = formDados.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'A salvar...';

      try {
        const response = await api.put('/usuarios/perfil', {
          nome,
          telefone,
          pais: pais ? normalizarTexto(pais) : null,
          provincia: provincia ? normalizarTexto(provincia) : null,
        });

        if (response.sucesso) {
          toasts.sucesso('Perfil atualizado com sucesso');
          // Atualizar dados do utilizador
          const userData = response.dados?.usuario;
          if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
            auth.user = userData;
            appState.set('user', userData);
            carregarPerfil();
          }
        }

        btn.disabled = false;
        btn.textContent = 'Salvar Alterações';
      } catch (error) {
        toasts.erro('Erro ao atualizar perfil');
        btn.disabled = false;
        btn.textContent = 'Salvar Alterações';
      }
    });
  }

  // Formulário de preferências
  const formPrefs = document.getElementById('formPreferencias');
  if (formPrefs) {
    formPrefs.addEventListener('submit', async (e) => {
      e.preventDefault();
      toasts.sucesso('Preferências salvas com sucesso');
    });
  }

  // Formulário de segurança (alterar senha)
  const formSeguranca = document.getElementById('formSeguranca');
  if (formSeguranca) {
    formSeguranca.addEventListener('submit', async (e) => {
      e.preventDefault();

      const senhaAtual = document.getElementById('senhaAtual')?.value;
      const novaSenha = document.getElementById('novaSenha')?.value;
      const confirmarSenha = document.getElementById('confirmarSenha')?.value;

      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        toasts.erro('Preencha todos os campos');
        return;
      }

      if (novaSenha.length < 8) {
        toasts.erro('A nova senha deve ter pelo menos 8 caracteres');
        return;
      }

      if (novaSenha !== confirmarSenha) {
        toasts.erro('As senhas não coincidem');
        return;
      }

      const btn = formSeguranca.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'A alterar...';

      try {
        const response = await api.put('/usuarios/senha', {
          senha_atual: senhaAtual,
          nova_senha: novaSenha,
        });

        if (response.sucesso) {
          toasts.sucesso('Senha alterada com sucesso');
          formSeguranca.reset();
        }

        btn.disabled = false;
        btn.textContent = 'Alterar Senha';
      } catch (error) {
        toasts.erro('Erro ao alterar senha');
        btn.disabled = false;
        btn.textContent = 'Alterar Senha';
      }
    });
  }
}

/**
 * Configura eventos da UI
 */
function setupEvents() {
  // Toggle de senha
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-wrapper')?.querySelector('input');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });

  // Excluir conta
  const btnExcluir = document.getElementById('btnExcluirConta');
  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
      const modal = document.getElementById('modalExcluirConta');
      if (modal) {
        modals.setup(modal);
        modals.open(modal);
      }
    });
  }

  // Confirmar exclusão
  const btnConfirmar = document.getElementById('btnConfirmarExclusao');
  const inputConfirm = document.getElementById('confirmarExclusao');

  if (btnConfirmar && inputConfirm) {
    inputConfirm.addEventListener('input', () => {
      btnConfirmar.disabled = inputConfirm.value !== 'EXCLUIR';
    });

    btnConfirmar.addEventListener('click', async () => {
      try {
        await api.delete('/usuarios/conta');
        toasts.sucesso('Conta excluída com sucesso');
        auth.logout();
      } catch (error) {
        toasts.erro('Erro ao excluir conta');
        modals.close(document.getElementById('modalExcluirConta'));
      }
    });
  }
}

/**
 * Normaliza texto (primeira letra maiúscula, resto minúscula)
 */
function normalizarTexto(texto) {
  if (!texto) return null;
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Formata moeda
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

// Exportar
export default { init };