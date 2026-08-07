/**
 * components.js — Fábrica de Componentes DOM Reutilizáveis
 * Teca Capital EdTech
 * 
 * Responsabilidade: Criar elementos DOM comuns (cards, botões,
 * modais, tabelas) de forma consistente em toda a aplicação.
 */

class Components {
  /**
   * Cria um card de conteúdo (Biblioteca)
   */
  criarCardConteudo(item, onClick) {
    const card = document.createElement('div');
    card.className = 'card-conteudo';
    card.dataset.id = item.id;
    card.dataset.tipo = item.tipo;

    const capa = document.createElement('div');
    capa.className = 'capa';
    
    const img = document.createElement('img');
    img.src = item.capa || '/assets/banners/placeholder.jpg';
    img.alt = item.titulo;
    img.loading = 'lazy';
    capa.appendChild(img);

    const tipoBadge = document.createElement('span');
    tipoBadge.className = 'tipo-badge';
    tipoBadge.textContent = this._getTipoLabel(item.tipo);
    capa.appendChild(tipoBadge);

    if (item.duracao) {
      const duracaoBadge = document.createElement('span');
      duracaoBadge.className = 'duracao-badge';
      duracaoBadge.textContent = item.duracao;
      capa.appendChild(duracaoBadge);
    }

    card.appendChild(capa);

    const info = document.createElement('div');
    info.className = 'info';

    const titulo = document.createElement('div');
    titulo.className = 'titulo';
    titulo.textContent = item.titulo;
    info.appendChild(titulo);

    const categoria = document.createElement('div');
    categoria.className = 'categoria';
    categoria.textContent = this._getCategoriaLabel(item.categoria);
    info.appendChild(categoria);

    const descricao = document.createElement('p');
    descricao.className = 'descricao';
    descricao.textContent = item.descricao || '';
    info.appendChild(descricao);

    const acoes = document.createElement('div');
    acoes.className = 'acoes';

    const favBtn = document.createElement('button');
    favBtn.className = 'btn-favorito';
    favBtn.innerHTML = '<i class="fas fa-heart"></i>';
    favBtn.setAttribute('aria-label', 'Favoritar');
    acoes.appendChild(favBtn);

    const stats = document.createElement('div');
    stats.className = 'estatisticas';
    stats.innerHTML = `
      <span class="like"><i class="fas fa-thumbs-up"></i> ${item.likes || 0}</span>
      <span class="dislike"><i class="fas fa-thumbs-down"></i> ${item.dislikes || 0}</span>
    `;
    acoes.appendChild(stats);

    info.appendChild(acoes);
    card.appendChild(info);

    // Eventos
    if (onClick) {
      card.addEventListener('click', () => onClick(item));
    }

    // Favoritar
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      favBtn.classList.toggle('ativo');
    });

    return card;
  }

  /**
   * Cria uma tabela de ativos (Simulador)
   */
  criarTabelaAtivos(ativos, onAcao) {
    const table = document.createElement('table');
    table.className = 'tabela tabela-ativos';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Ativo</th>
        <th class="numerico">Preço</th>
        <th class="numerico">Var.%</th>
        <th class="numerico">Volume</th>
        <th class="acao">Ação</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    
    ativos.forEach(ativo => {
      const tr = document.createElement('tr');
      
      const variacao = ativo.variacao || 0;
      const variacaoClass = variacao >= 0 ? 'positivo' : 'negativo';
      const variacaoSymbol = variacao >= 0 ? '+' : '';

      tr.innerHTML = `
        <td>
          <div class="ticker">${ativo.ticker || ativo.id}</div>
          <div class="nome">${ativo.nome || ativo.id}</div>
        </td>
        <td class="numerico preco">${this._formatPreco(ativo.preco, ativo.moeda)}</td>
        <td class="numerico variacao ${variacaoClass}">${variacaoSymbol}${variacao.toFixed(2)}%</td>
        <td class="numerico volume">${this._formatVolume(ativo.volume)}</td>
        <td class="acao">
          <button class="btn btn-sm btn-primario btn-comprar" data-id="${ativo.id}">Comprar</button>
          <button class="btn btn-sm btn-secundario btn-vender" data-id="${ativo.id}">Vender</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Eventos dos botões
    if (onAcao) {
      table.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', () => onAcao('comprar', btn.dataset.id));
      });
      table.querySelectorAll('.btn-vender').forEach(btn => {
        btn.addEventListener('click', () => onAcao('vender', btn.dataset.id));
      });
    }

    return table;
  }

  /**
   * Cria uma notificação toast
   */
  criarToast(mensagem, tipo = 'info', duracao = 4000) {
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
      this._fecharToast(toast);
    });

    // Auto-fechar após duração
    if (duracao > 0) {
      setTimeout(() => {
        this._fecharToast(toast);
      }, duracao);
    }

    return toast;
  }

  /**
   * Fecha um toast com animação
   */
  _fecharToast(toast) {
    if (toast.classList.contains('saindo')) return;
    toast.classList.add('saindo');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  /**
   * Cria um modal
   */
  criarModal(titulo, conteudo, footer = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <h3 class="titulo">${titulo}</h3>
      <button class="fechar" aria-label="Fechar">&times;</button>
    `;
    modal.appendChild(header);

    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof conteudo === 'string') {
      body.innerHTML = conteudo;
    } else {
      body.appendChild(conteudo);
    }
    modal.appendChild(body);

    if (footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'modal-footer';
      if (typeof footer === 'string') {
        footerEl.innerHTML = footer;
      } else {
        footerEl.appendChild(footer);
      }
      modal.appendChild(footerEl);
    }

    overlay.appendChild(modal);

    // Fechar
    const closeBtn = header.querySelector('.fechar');
    closeBtn.addEventListener('click', () => this.fecharModal(overlay));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.fecharModal(overlay);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('ativo')) {
        this.fecharModal(overlay);
      }
    });

    return overlay;
  }

  /**
   * Abre um modal
   */
  abrirModal(modal) {
    modal.classList.add('ativo');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fecha um modal
   */
  fecharModal(modal) {
    modal.classList.remove('ativo');
    document.body.style.overflow = '';
  }

  /**
   * Formatadores auxiliares
   */
  _formatPreco(preco, moeda = 'Kz') {
    if (preco === undefined || preco === null) return '0,00';
    const symbols = { 'Kz': 'Kz ', 'USD': '$ ', 'EUR': '€ ', 'GBP': '£ ', 'JPY': '¥ ', 'CNY': '¥ ', 'BRL': 'R$ ' };
    const symbol = symbols[moeda] || moeda + ' ';
    return `${symbol}${preco.toFixed(2).replace('.', ',')}`;
  }

  _formatVolume(volume) {
    if (!volume) return '0';
    if (volume >= 1000000000) return (volume / 1000000000).toFixed(1) + 'B';
    if (volume >= 1000000) return (volume / 1000000).toFixed(1) + 'M';
    if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K';
    return volume.toString();
  }

  _getTipoLabel(tipo) {
    const labels = {
      'video': 'Vídeo',
      'audio': 'Áudio',
      'ebook': 'E-book',
      'imagem': 'Infográfico',
    };
    return labels[tipo] || tipo;
  }

  _getCategoriaLabel(categoria) {
    const labels = {
      'investimentos': 'Investimentos',
      'economia': 'Economia',
      'mercados': 'Mercados',
      'analise': 'Análise Financeira',
      'estrategias': 'Estratégias',
      'risco': 'Gestão de Risco',
    };
    return labels[categoria] || categoria;
  }
}

// Instância única
export const components = new Components();