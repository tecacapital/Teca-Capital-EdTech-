/**
 * roles.js — Constantes de Perfis
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar os perfis de utilizador
 * e suas permissões.
 */

export const ROLES = {
  ADMIN: 'admin',
  FUNCIONARIO: 'funcionario',
  PARCEIRO: 'parceiro',
  USUARIO: 'usuario',
  SUB_USUARIO: 'sub_usuario',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.FUNCIONARIO]: 'Funcionário',
  [ROLES.PARCEIRO]: 'Parceiro',
  [ROLES.USUARIO]: 'Utilizador',
  [ROLES.SUB_USUARIO]: 'Subutilizador',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    verSimulador: true,
    verBiblioteca: true,
    verProvas: true,
    verAdmin: true,
    verFuncionario: true,
    gerirUtilizadores: true,
    gerirPagamentos: true,
    gerirFuncionarios: true,
    gerirParceiros: true,
    verAuditoria: true,
  },
  [ROLES.FUNCIONARIO]: {
    verSimulador: true,
    verBiblioteca: true,
    verProvas: true,
    verAdmin: false,
    verFuncionario: true,
    gerirUtilizadores: false,
    gerirPagamentos: true,
    gerirFuncionarios: false,
    gerirParceiros: false,
    verAuditoria: false,
  },
  [ROLES.PARCEIRO]: {
    verSimulador: true,
    verBiblioteca: true,
    verProvas: true,
    verAdmin: false,
    verFuncionario: false,
    gerirUtilizadores: true,
    gerirPagamentos: false,
    gerirFuncionarios: false,
    gerirParceiros: false,
    verAuditoria: false,
  },
  [ROLES.USUARIO]: {
    verSimulador: true,
    verBiblioteca: false,
    verProvas: true,
    verAdmin: false,
    verFuncionario: false,
    gerirUtilizadores: false,
    gerirPagamentos: false,
    gerirFuncionarios: false,
    gerirParceiros: false,
    verAuditoria: false,
  },
};

export default { ROLES, ROLE_LABELS, ROLE_PERMISSIONS };