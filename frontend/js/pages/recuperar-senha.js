/**
 * recuperar-senha.js — Lógica da Página de Recuperação de Senha
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar o fluxo de recuperação de senha
 * via WhatsApp.
 */

import { auth } from '../auth.js';
import { toasts } from '../ui/toasts.js';

let recoveryToken = null;

export function init() {
  // Verificar se já está autenticado
  if (auth.isAuthenticated) {
    window.location.href = '/simulador.html';
    return;
  }
  
  // Configurar formulários
  setupFormSolicitar();
  setupFormVerificar();
  
  // Configurar reenvio de código
  setupReenviar();
  
  console.log('Página de Recuperação de Senha carregada');
}

/**
 * Configura o formulário de solicitação
 */
function setupFormSolicitar() {
  const form = document.getElementById('formSolicitarRecuperacao');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contato = document.getElementById('recoverEmail')?.value;
    
    if (!contato) {
      toasts.erro('Informe o seu email ou número de telefone');
      return;
    }
    
    // Desabilitar botão
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A enviar...';
    
    try {
      const result = await auth.solicitarRecuperacao(contato);
      
      if (result.sucesso) {
        // Mostrar formulário de verificação
        document.getElementById('formSolicitarRecuperacao').style.display = 'none';
        document.getElementById('formVerificarCodigo').style.display = 'block';
        recoveryToken = null;
        
        // Iniciar contagem regressiva para reenvio
        iniciarContagemReenvio();
      }
      
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-whatsapp"></i> Enviar código via WhatsApp';
    } catch (error) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-whatsapp"></i> Enviar código via WhatsApp';
    }
  });
}

/**
 * Configura o formulário de verificação
 */
function setupFormVerificar() {
  const form = document.getElementById('formVerificarCodigo');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = document.getElementById('recoverToken')?.value;
    const novaSenha = document.getElementById('recoverNewPassword')?.value;
    const confirmarSenha = document.getElementById('recoverConfirmPassword')?.value;
    
    if (!token || !novaSenha || !confirmarSenha) {
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
    
    // Desabilitar botão
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'A redefinir...';
    
    try {
      const result = await auth.redefinirSenha(token, novaSenha);
      
      if (result.sucesso) {
        // Redirecionar para login
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
      } else {
        btn.disabled = false;
        btn.textContent = 'Redefinir Senha';
      }
    } catch (error) {
      btn.disabled = false;
      btn.textContent = 'Redefinir Senha';
    }
  });
}

/**
 * Configura o botão de reenvio de código
 */
function setupReenviar() {
  const btn = document.getElementById('btnReenviarCodigo');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    // Reenviar código
    const contato = document.getElementById('recoverEmail')?.value;
    if (contato) {
      auth.solicitarRecuperacao(contato);
      iniciarContagemReenvio();
    }
  });
}

/**
 * Inicia a contagem regressiva para reenvio
 */
function iniciarContagemReenvio() {
  const btn = document.getElementById('btnReenviarCodigo');
  if (!btn) return;
  
  let segundos = 30;
  btn.disabled = true;
  btn.textContent = `Reenviar em ${segundos}s`;
  
  const interval = setInterval(() => {
    segundos--;
    if (segundos <= 0) {
      clearInterval(interval);
      btn.disabled = false;
      btn.textContent = 'Reenviar código';
    } else {
      btn.textContent = `Reenviar em ${segundos}s`;
    }
  }, 1000);
}

// Exportar
export default { init };