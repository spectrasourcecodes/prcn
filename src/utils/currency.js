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
  JOD: 'JOD',
};

export const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return 'JOD';
  return CURRENCY_SYMBOLS[currencyCode] || 'JOD';
};

export const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_SYMBOLS);
};