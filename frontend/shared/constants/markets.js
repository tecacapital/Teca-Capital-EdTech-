/**
 * markets.js — Constantes de Mercados
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar informações dos mercados
 * financeiros disponíveis no simulador.
 */

export const MARKETS = {
  ANGOLA: {
    id: 'angola',
    nome: 'Angola',
    bolsa: 'BODIVA',
    moeda: 'AOA',
    empresas: 6,
    ipos: 5,
  },
  EUA: {
    id: 'eua',
    nome: 'EUA',
    bolsa: 'NYSE/NASDAQ',
    moeda: 'USD',
    empresas: 20,
  },
  EUROPA: {
    id: 'europa',
    nome: 'Europa',
    bolsa: 'Euronext/DAX',
    moeda: 'EUR',
    empresas: 10,
  },
  CHINA: {
    id: 'china',
    nome: 'China',
    bolsa: 'SSE/SZSE',
    moeda: 'CNY',
    empresas: 10,
  },
  JAPAO: {
    id: 'japao',
    nome: 'Japão',
    bolsa: 'TSE',
    moeda: 'JPY',
    empresas: 10,
  },
  BRASIL: {
    id: 'brasil',
    nome: 'Brasil',
    bolsa: 'B3',
    moeda: 'BRL',
    empresas: 10,
  },
};

export const MARKET_TYPES = {
  NACIONAL: 'nacional',
  INTERNACIONAL: 'internacional',
};

export const MARKET_LIST = Object.values(MARKETS);

export default { MARKETS, MARKET_TYPES, MARKET_LIST };