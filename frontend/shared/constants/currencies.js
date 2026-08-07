/**
 * currencies.js — Constantes de Moedas
 * Teca Capital EdTech
 * 
 * Responsabilidade: Centralizar informações das moedas
 * suportadas pelo sistema.
 */

export const CURRENCIES = {
  AOA: {
    codigo: 'AOA',
    simbolo: 'Kz',
    nome: 'Kwanza Angolano',
    pais: 'Angola',
    decimalPlaces: 2,
  },
  USD: {
    codigo: 'USD',
    simbolo: '$',
    nome: 'Dólar Americano',
    pais: 'EUA',
    decimalPlaces: 2,
  },
  EUR: {
    codigo: 'EUR',
    simbolo: '€',
    nome: 'Euro',
    pais: 'Europa',
    decimalPlaces: 2,
  },
  JPY: {
    codigo: 'JPY',
    simbolo: '¥',
    nome: 'Iene Japonês',
    pais: 'Japão',
    decimalPlaces: 0,
  },
  CNY: {
    codigo: 'CNY',
    simbolo: '¥',
    nome: 'Yuan Chinês',
    pais: 'China',
    decimalPlaces: 2,
  },
  BRL: {
    codigo: 'BRL',
    simbolo: 'R$',
    nome: 'Real Brasileiro',
    pais: 'Brasil',
    decimalPlaces: 2,
  },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);
export const CURRENCY_CODES = Object.keys(CURRENCIES);

export default { CURRENCIES, CURRENCY_LIST, CURRENCY_CODES };