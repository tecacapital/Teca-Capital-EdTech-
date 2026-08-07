/**
 * contato.js — Lógica da Página de Contactos
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar o formulário de contacto
 * e validações.
 */

import { toasts } from '../ui/toasts.js';

export function init() {
  // Configurar formulário de contacto
  setupContactForm();
  
  console.log('Página de Contactos carregada');
}

/**
 * Configura o formulário de contacto
 */
function setupContactForm() {
  const form = document.getElementById('formContato');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('contatoNome')?.value;
    const email = document.getElementById('contatoEmail')?.value;
    const assunto = document.getElementById('contatoAssunto')?.value;
    const mensagem = document.getElementById('contatoMensagem')?.value;
    
    // Validações
    if (!nome || !email || !assunto || !mensagem) {
      toasts.erro('Preencha todos os campos');
      return;
    }
    
    if (!email.includes('@')) {
      toasts.erro('Email inválido');
      return;
    }
    
    // Desabilitar botão
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'A enviar...';
    
    try {
      // TODO: Integrar com API de envio de email
      // Por enquanto, apenas simular
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toasts.sucesso('Mensagem enviada com sucesso! Entraremos em contacto brevemente.');
      form.reset();
      
      btn.disabled = false;
      btn.textContent = 'Enviar Mensagem';
    } catch (error) {
      toasts.erro('Erro ao enviar mensagem. Tente novamente.');
      btn.disabled = false;
      btn.textContent = 'Enviar Mensagem';
    }
  });
}

// Exportar
export default { init };