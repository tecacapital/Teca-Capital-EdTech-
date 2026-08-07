/**
 * modals.js — Controlo de Modais
 * Teca Capital EdTech
 * 
 * Responsabilidade: Gerenciar a abertura, fecho e estado dos modais.
 */

class Modals {
  constructor() {
    this.activeModal = null;
    this.callbacks = {};
  }

  /**
   * Abre um modal
   */
  open(modalElement, callback) {
    if (this.activeModal) {
      this.close(this.activeModal);
    }

    modalElement.classList.add('ativo');
    document.body.style.overflow = 'hidden';
    this.activeModal = modalElement;

    if (callback) {
      this.callbacks[modalElement.id] = callback;
    }

    // Disparar evento
    modalElement.dispatchEvent(new CustomEvent('modal:open'));
  }

  /**
   * Fecha um modal
   */
  close(modalElement) {
    if (!modalElement) return;

    modalElement.classList.remove('ativo');
    document.body.style.overflow = '';
    
    if (this.activeModal === modalElement) {
      this.activeModal = null;
    }

    // Disparar evento
    modalElement.dispatchEvent(new CustomEvent('modal:close'));

    // Limpar callback
    if (modalElement.id && this.callbacks[modalElement.id]) {
      delete this.callbacks[modalElement.id];
    }
  }

  /**
   * Fecha o modal ativo
   */
  closeActive() {
    if (this.activeModal) {
      this.close(this.activeModal);
    }
  }

  /**
   * Configura um modal com comportamento padrão
   */
  setup(modalElement, options = {}) {
    const { closeOnOverlay = true, closeOnEscape = true } = options;

    // Fechar com X
    const closeBtn = modalElement.querySelector('[data-modal-fechar]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close(modalElement));
    }

    // Fechar ao clicar no overlay
    if (closeOnOverlay) {
      modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) {
          this.close(modalElement);
        }
      });
    }

    // Fechar com ESC
    if (closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModal === modalElement) {
          this.close(modalElement);
        }
      });
    }

    // Fechar ao perder foco
    modalElement.addEventListener('focusout', (e) => {
      if (!modalElement.contains(e.relatedTarget) && this.activeModal === modalElement) {
        if (options.closeOnBlur) {
          this.close(modalElement);
        }
      }
    });
  }

  /**
   * Cria um modal de confirmação simples
   */
  confirm(titulo, mensagem, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalConfirmacao';

    overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="titulo">${titulo}</h3>
          <button class="fechar" data-modal-fechar aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body">
          <p>${mensagem}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secundario" data-cancelar>Cancelar</button>
          <button class="btn btn-primario" data-confirmar>Confirmar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    this.setup(overlay, { closeOnOverlay: true, closeOnEscape: true });

    overlay.querySelector('[data-confirmar]').addEventListener('click', () => {
      this.close(overlay);
      if (onConfirm) onConfirm();
      setTimeout(() => overlay.remove(), 300);
    });

    overlay.querySelector('[data-cancelar]').addEventListener('click', () => {
      this.close(overlay);
      if (onCancel) onCancel();
      setTimeout(() => overlay.remove(), 300);
    });

    overlay.querySelector('[data-modal-fechar]').addEventListener('click', () => {
      this.close(overlay);
      if (onCancel) onCancel();
      setTimeout(() => overlay.remove(), 300);
    });

    this.open(overlay);

    return overlay;
  }

  /**
   * Cria um modal de alerta simples
   */
  alert(titulo, mensagem, callback = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalAlerta';

    overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="titulo">${titulo}</h3>
          <button class="fechar" data-modal-fechar aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body">
          <p>${mensagem}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primario" data-confirmar>OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    this.setup(overlay, { closeOnOverlay: true, closeOnEscape: true });

    overlay.querySelector('[data-confirmar]').addEventListener('click', () => {
      this.close(overlay);
      if (callback) callback();
      setTimeout(() => overlay.remove(), 300);
    });

    overlay.querySelector('[data-modal-fechar]').addEventListener('click', () => {
      this.close(overlay);
      if (callback) callback();
      setTimeout(() => overlay.remove(), 300);
    });

    this.open(overlay);

    return overlay;
  }
}

// Instância única
export const modals = new Modals();