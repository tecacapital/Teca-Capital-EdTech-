/**
 * toasts.js — Notificações Temporárias
 * Teca Capital EdTech
 * 
 * Responsabilidade: Exibir mensagens de feedback (sucesso, erro,
 * alerta, info) com animação e auto-fechamento.
 */

class Toasts {
  constructor() {
    this.container = null;
    this.defaultDuration = 4000;
  }

  /**
   * Inicializa o container de toasts
   */
  init() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Exibe um toast de sucesso
   */
  sucesso(mensagem, duracao = this.defaultDuration) {
    this._mostrar(mensagem, 'sucesso', duracao);
  }

  /**
   * Exibe um toast de erro
   */
  erro(mensagem, duracao = this.defaultDuration) {
    this._mostrar(mensagem, 'erro', duracao);
  }

  /**
   * Exibe um toast de alerta
   */
  alerta(mensagem, duracao = this.defaultDuration) {
    this._mostrar(mensagem, 'alerta', duracao);
  }

  /**
   * Exibe um toast informativo
   */
  info(mensagem, duracao = this.defaultDuration) {
    this._mostrar(mensagem, 'info', duracao);
  }

  /**
   * Mostra um toast
   */
  _mostrar(mensagem, tipo, duracao) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    const iconMap = {
      sucesso: 'fa-check-circle',
      erro: 'fa-exclamation-circle',
      alerta: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
    };

    toast.innerHTML = `
      <span class="icone"><i class="fas ${iconMap[tipo] || iconMap.info}"></i></span>
      <span class="mensagem">${mensagem}</span>
      <button class="fechar" aria-label="Fechar">&times;</button>
    `;

    const closeBtn = toast.querySelector('.fechar');
    closeBtn.addEventListener('click', () => {
      this._fechar(toast);
    });

    this.container.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    // Auto-fechar
    if (duracao > 0) {
      const timeout = setTimeout(() => {
        this._fechar(toast);
      }, duracao);
      
      // Armazenar timeout para cancelar se fechado manualmente
      toast.dataset.timeout = timeout;
    }
  }

  /**
   * Fecha um toast com animação
   */
  _fechar(toast) {
    if (toast.classList.contains('saindo')) return;

    // Cancelar timeout
    if (toast.dataset.timeout) {
      clearTimeout(parseInt(toast.dataset.timeout));
    }

    toast.classList.add('saindo');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }

  /**
   * Limpa todos os toasts
   */
  limpar() {
    if (this.container) {
      const toasts = this.container.querySelectorAll('.toast');
      toasts.forEach(toast => this._fechar(toast));
    }
  }

  /**
   * Remove o container
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

// Instância única
export const toasts = new Toasts();