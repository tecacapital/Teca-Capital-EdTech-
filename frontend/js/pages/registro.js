/**
 * registro.js — Lógica da Página de Registo (ATUALIZADO)
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar o formulário de registo,
 * seleção de plano, validações e normalização de dados.
 */

import { auth } from '../auth.js';
import { toasts } from '../ui/toasts.js';

export function init() {
  // Verificar se já está autenticado
  if (auth.isAuthenticated) {
    window.location.href = '/perfil.html';
    return;
  }

  // Configurar seleção de plano
  setupPlanSelector();

  // Configurar formulário
  setupForm();

  // Configurar toggle de senha
  setupPasswordToggles();

  // Detetar plano via URL
  detectPlanFromURL();

  console.log('Página de Registo carregada');
}

/**
 * Configura o seletor de planos
 */
function setupPlanSelector() {
  const options = document.querySelectorAll('.plan-selector-option');

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      const plano = opt.dataset.plano;
      atualizarInfoPlano(plano);

      // Mostrar/ocultar lotes empresariais
      const lotesContainer = document.getElementById('lotesEmpresariais');
      if (lotesContainer) {
        lotesContainer.style.display = plano === 'empresa' ? 'block' : 'none';
      }
    });
  });
}

/**
 * Atualiza a informação do plano selecionado
 */
function atualizarInfoPlano(plano) {
  const infoEl = document.getElementById('planoInfoText');
  if (!infoEl) return;

  const messages = {
    'gratuito': 'Conta gratuita — acesso restrito ao simulador (mercado nacional + BR, renda até 250.000 Kz)',
    'pago': 'Conta paga: acesso total a todos os mercados, biblioteca completa e indicadores avançados por 5.000 Kz/mês',
    'empresa': 'Conta empresarial: acesso total com gestão de subutilizadores  por 12.500 Kz/lote (5 subutilizadores)/mês',
  };

  infoEl.textContent = messages[plano] || messages['gratuito'];
}

/**
 * Normaliza texto (primeira letra maiúscula, resto minúscula)
 */
function normalizarTexto(texto) {
  if (!texto) return null;
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Configura o formulário de registo (ATUALIZADO)
 */
function setupForm() {
  const form = document.getElementById('formRegistro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Recolher dados
    const nome = document.getElementById('regNome')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim();
    const telefone = document.getElementById('regTelefone')?.value?.trim();
    const senha = document.getElementById('regPassword')?.value;
    const confirmarSenha = document.getElementById('regConfirmPassword')?.value;
    const pais = document.getElementById('regPais')?.value?.trim();
    const provincia = document.getElementById('regProvincia')?.value?.trim();
    const termos = document.getElementById('termsCheck')?.checked;
    const privacidade = document.getElementById('privacyCheck')?.checked;

    // Validações
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      toasts.erro('Preencha todos os campos obrigatórios');
      return;
    }

    if (senha.length < 8) {
      toasts.erro('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      toasts.erro('As senhas não coincidem');
      return;
    }

    if (!termos) {
      toasts.erro('Aceite os Termos de Uso');
      return;
    }

    if (!privacidade) {
      toasts.erro('Aceite a Política de Privacidade');
      return;
    }

    // Detetar plano selecionado
    const planoSelecionado = document.querySelector('.plan-selector-option.active');
    const plano = planoSelecionado?.dataset.plano || 'gratuito';

    // Normalizar país e província
    const paisNormalizado = normalizarTexto(pais);
    const provinciaNormalizada = normalizarTexto(provincia);

    // Preparar dados
    const dadosRegisto = {
      nome,
      email,
      senha,
      telefone,
      tipo_usuario: plano === 'empresa' ? 'empresa' : 'individual',
      plano,
      pais: paisNormalizado,
      provincia: provinciaNormalizada,
    };

    // Se for empresa, capturar número de lotes
    if (plano === 'empresa') {
      const lotesSelect = document.getElementById('regLotes');
      if (lotesSelect) {
        dadosRegisto.lotes = parseInt(lotesSelect.value) || 1;
      }
    }

    // Desabilitar botão
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'A criar conta...';

    try {
      const result = await auth.registar(dadosRegisto);

      if (result.sucesso) {
        // O auth.registar já faz o login e redireciona para o perfil
        // Não fazer nada aqui
      } else {
        btn.disabled = false;
        btn.textContent = 'Criar Conta';
      }
    } catch (error) {
      btn.disabled = false;
      btn.textContent = 'Criar Conta';
    }
  });
}

/**
 * Configura os toggles de senha
 */
function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-wrapper')?.querySelector('input');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });
}

/**
 * Deteta o plano a partir da URL
 */
function detectPlanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const plano = params.get('plano');

  if (plano) {
    const option = document.querySelector(`.plan-selector-option[data-plano="${plano}"]`);
    if (option) {
      option.click();
    }
  }
}

// Exportar
export default { init };