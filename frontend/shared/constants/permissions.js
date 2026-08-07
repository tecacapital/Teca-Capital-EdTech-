/**
 * permissions.js — Constantes de Permissões
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar as permissões do sistema
 * para verificação de acesso.
 */

export const PERMISSIONS = {
  // Acessos a páginas
  PAGE_SIMULADOR: 'page:simulador',
  PAGE_BIBLIOTECA: 'page:biblioteca',
  PAGE_PROVAS: 'page:provas',
  PAGE_ADMIN: 'page:admin',
  PAGE_FUNCIONARIO: 'page:funcionario',
  PAGE_PERFIL: 'page:perfil',
  
  // Ações de gestão
  MANAGE_USERS: 'manage:users',
  MANAGE_PAYMENTS: 'manage:payments',
  MANAGE_EMPLOYEES: 'manage:employees',
  MANAGE_PARTNERS: 'manage:partners',
  VIEW_AUDIT: 'view:audit',
  
  // Ações do simulador
  SIMULATOR_TRADE: 'simulator:trade',
  SIMULATOR_CREDIT: 'simulator:credit',
  SIMULATOR_RESET: 'simulator:reset',
  
  // Ações da biblioteca
  LIBRARY_VIEW: 'library:view',
  LIBRARY_FAVORITE: 'library:favorite',
  LIBRARY_LIKE: 'library:like',
  
  // Ações de provas
  PROVAS_TAKE: 'provas:take',
  PROVAS_CERTIFICATE: 'provas:certificate',
};

export const PERMISSION_ROLES = {
  [PERMISSIONS.PAGE_SIMULADOR]: ['admin', 'funcionario', 'parceiro', 'usuario', 'sub_usuario'],
  [PERMISSIONS.PAGE_BIBLIOTECA]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.PAGE_PROVAS]: ['admin', 'funcionario', 'parceiro', 'usuario', 'sub_usuario'],
  [PERMISSIONS.PAGE_ADMIN]: ['admin'],
  [PERMISSIONS.PAGE_FUNCIONARIO]: ['admin', 'funcionario'],
  [PERMISSIONS.PAGE_PERFIL]: ['admin', 'funcionario', 'parceiro', 'usuario', 'sub_usuario'],
  [PERMISSIONS.MANAGE_USERS]: ['admin'],
  [PERMISSIONS.MANAGE_PAYMENTS]: ['admin', 'funcionario'],
  [PERMISSIONS.MANAGE_EMPLOYEES]: ['admin'],
  [PERMISSIONS.MANAGE_PARTNERS]: ['admin'],
  [PERMISSIONS.VIEW_AUDIT]: ['admin'],
  [PERMISSIONS.SIMULATOR_TRADE]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.SIMULATOR_CREDIT]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.SIMULATOR_RESET]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.LIBRARY_VIEW]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.LIBRARY_FAVORITE]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.LIBRARY_LIKE]: ['admin', 'funcionario', 'parceiro', 'usuario'],
  [PERMISSIONS.PROVAS_TAKE]: ['admin', 'funcionario', 'parceiro', 'usuario', 'sub_usuario'],
  [PERMISSIONS.PROVAS_CERTIFICATE]: ['admin', 'funcionario', 'parceiro', 'usuario'],
};

export default { PERMISSIONS, PERMISSION_ROLES };