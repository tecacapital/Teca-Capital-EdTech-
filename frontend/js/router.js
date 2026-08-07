/**
 * router.js — Navegação SPA Simulada
 * Teca Capital EdTech
 * 
 * Responsabilidade: Intercetar cliques em links internos, usar
 * history.pushState para navegação sem recarregar a página.
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentPath = '';
    this.afterNavigate = null;
  }

  /**
   * Inicializa o router
   */
  init() {
    // Escutar mudanças de histórico (back/forward)
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // Configurar link interceptors
    this.setupLinkInterceptors();

    // Rota inicial
    this.currentPath = window.location.pathname;
  }

  /**
   * Configura interceptores de cliques em links internos
   */
  setupLinkInterceptors() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignorar links externos, âncoras, downloads, target="_blank"
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        link.getAttribute('target') === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      // Ignorar links administrativos ocultos
      if (href === '/admin.html' || href === '/funcionario.html') {
        return;
      }

      e.preventDefault();
      this.navigate(href);
    });
  }

  /**
   * Navega para uma nova rota
   */
  navigate(path) {
    const fullPath = path.startsWith('/') ? path : '/' + path;
    
    // Atualizar URL
    window.history.pushState({}, '', fullPath);
    
    // Processar rota
    this.handleRoute(fullPath);
  }

  /**
   * Processa uma rota (carrega a página correspondente)
   */
  async handleRoute(path) {
    // Normalizar caminho
    const normalizedPath = path.split('?')[0];
    this.currentPath = normalizedPath;

    // Determinar página
    const page = this.getPageFromPath(normalizedPath);
    
    try {
      // Carregar módulo da página
      const module = await this.loadPageModule(page);
      
      if (module && typeof module.init === 'function') {
        module.init();
      }

      // Atualizar UI
      this.updateActiveNav(normalizedPath);
      this.updatePageTitle(page);

      // Executar callback pós-navegação
      if (this.afterNavigate) {
        this.afterNavigate(page);
      }

    } catch (error) {
      console.error('Erro ao navegar para:', path, error);
      // Fallback: recarregar página
      window.location.href = path;
    }
  }

  /**
   * Obtém o nome da página a partir do caminho
   */
  getPageFromPath(path) {
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '') || 'index';
  }

  /**
   * Carrega dinamicamente o módulo da página
   */
  async loadPageModule(page) {
    const modules = {
      'index': () => import('./pages/home.js'),
      'login': () => import('./pages/login.js'),
      'registro': () => import('./pages/registro.js'),
      'recuperar-senha': () => import('./pages/recuperar-senha.js'),
      'simulador': () => import('./simulador/dashboard.js'),
      'biblioteca': () => import('./biblioteca/catalogo.js'),
      'referencias': () => import('./pages/referencias.js'),
      'contato': () => import('./pages/contato.js'),
      'admin': () => import('./pages/admin.js'),
      'funcionario': () => import('./pages/funcionario.js'),
      'provas': () => import('./pages/provas.js'),
    };

    if (modules[page]) {
      return await modules[page]();
    }
    return null;
  }

  /**
   * Atualiza o item ativo no menu de navegação
   */
  updateActiveNav(path) {
    const page = this.getPageFromPath(path);
    const navLinks = document.querySelectorAll('.nav-principal a, .menu-mobile-nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPage = href.replace('.html', '') || 'index';
        if (linkPage === page) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  /**
   * Atualiza o título da página
   */
  updatePageTitle(page) {
    const titles = {
      'index': 'Início — Teca Capital EdTech',
      'login': 'Login — Teca Capital EdTech',
      'registro': 'Criar Conta — Teca Capital EdTech',
      'recuperar-senha': 'Recuperar Senha — Teca Capital EdTech',
      'simulador': 'Simulador de Mercados — Teca Capital EdTech',
      'biblioteca': 'Biblioteca Multimídia — Teca Capital EdTech',
      'referencias': 'Referências Financeiras — Teca Capital EdTech',
      'contato': 'Sobre Nós — Teca Capital EdTech',
      'admin': 'Administração — Teca Capital EdTech',
      'funcionario': 'Funcionário — Teca Capital EdTech',
      'provas': 'Certificação — Teca Capital EdTech',
    };
    document.title = titles[page] || 'Teca Capital EdTech';
  }

  /**
   * Redireciona para uma rota
   */
  redirect(path) {
    window.location.href = path;
  }
}

// Instância única
export const router = new Router();