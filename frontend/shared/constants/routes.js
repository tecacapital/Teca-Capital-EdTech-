/**
 * routes.js — Constantes de Rotas
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar os caminhos das páginas
 * para navegação consistente.
 */

export const ROUTES = {
  // Páginas públicas
  HOME: '/index.html',
  LOGIN: '/login.html',
  REGISTRO: '/registro.html',
  RECUPERAR_SENHA: '/recuperar-senha.html',
  REFERENCIAS: '/referencias.html',
  CONTATO: '/contato.html',
  
  // Páginas principais (autenticadas)
  SIMULADOR: '/simulador.html',
  BIBLIOTECA: '/biblioteca.html',
  PROVAS: '/provas.html',
  PERFIL: '/perfil.html',
  
  // Subpáginas da Biblioteca
  BIBLIOTECA_VIDEOS: '/pages/biblioteca/biblioteca-videos.html',
  BIBLIOTECA_AUDIOS: '/pages/biblioteca/biblioteca-audios.html',
  BIBLIOTECA_EBOOKS: '/pages/biblioteca/biblioteca-ebooks.html',
  BIBLIOTECA_IMAGENS: '/pages/biblioteca/biblioteca-imagens.html',
  
  // Subpáginas de Provas
  INICIAR_PROVA: '/pages/provas/iniciar-prova.html',
  RESULTADO_PROVA: '/pages/provas/resultado-prova.html',
  CERTIFICADOS: '/pages/provas/certificados.html',
  
  // Subpáginas do Simulador
  CARTEIRA: '/pages/simulador/carteira.html',
  MERCADOS: '/pages/simulador/mercados.html',
  ATIVO_DETALHE: '/pages/simulador/ativo-detalhe.html',
  HISTORICO: '/pages/simulador/historico.html',
  
  // Painéis administrativos (ocultos)
  ADMIN: '/admin.html',
  FUNCIONARIO: '/funcionario.html',
};

export default ROUTES;