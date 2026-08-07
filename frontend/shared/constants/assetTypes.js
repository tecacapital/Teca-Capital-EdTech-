/**
 * assetTypes.js — Constantes de Tipos de Ativo
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar os tipos de ativos
 * disponíveis no simulador.
 */

export const ASSET_TYPES = {
  ACAO: {
    id: 'acao',
    nome: 'Ação',
    icon: 'fa-chart-line',
    cor: '#4CAF50',
  },
  TITULO: {
    id: 'titulo',
    nome: 'Título',
    icon: 'fa-file-invoice',
    cor: '#2196F3',
  },
  ETF: {
    id: 'etf',
    nome: 'ETF',
    icon: 'fa-layer-group',
    cor: '#9C27B0',
  },
  CRIPTO: {
    id: 'cripto',
    nome: 'Criptomoeda',
    icon: 'fa-bitcoin',
    cor: '#FF9800',
  },
  COMMODITY: {
    id: 'commodity',
    nome: 'Commodity',
    icon: 'fa-oil-can',
    cor: '#795548',
  },
  IMOVEL: {
    id: 'imovel',
    nome: 'Imóvel',
    icon: 'fa-home',
    cor: '#607D8B',
  },
  FOREX: {
    id: 'forex',
    nome: 'Forex',
    icon: 'fa-exchange-alt',
    cor: '#00BCD4',
  },
};

export const ASSET_TYPE_LIST = Object.values(ASSET_TYPES);

export default { ASSET_TYPES, ASSET_TYPE_LIST };