// src/utils/currency.js

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  BRL: 'R$',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  AED: 'د.إ',
  SAR: '﷼',
  INR: '₹',
  PKR: '₨',
  KES: 'KSh',
  GHS: '₵',
  ZAR: 'R',
  DZD: 'دج',
  JOD: 'د.ا',
};

export const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_SYMBOLS[currencyCode] || '$';
};

export const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_SYMBOLS);
};