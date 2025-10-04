import { api } from "./api-client";

export interface CountryCurrency {
  country: string;
  currencies: {
    code: string;
    name: string;
    symbol: string;
  }[];
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface CurrencyConversion {
  convertedAmount: number;
  exchangeRate: number;
}

export const currencyApi = {
  /**
   * Get all countries with their currencies
   */
  getCountriesWithCurrencies: async (): Promise<CountryCurrency[]> => {
    const response = await api.get<CountryCurrency[]>("/currency/countries");
    return response.data;
  },

  /**
   * Get all unique currencies
   */
  getAllCurrencies: async (): Promise<Currency[]> => {
    const response = await api.get<Currency[]>("/currency/list");
    return response.data;
  },

  /**
   * Get exchange rates for a base currency
   */
  getExchangeRates: async (
    baseCurrency: string = "USD"
  ): Promise<ExchangeRates> => {
    const response = await api.get<ExchangeRates>("/currency/rates", {
      params: { base: baseCurrency },
    });
    return response.data;
  },

  /**
   * Convert an amount from one currency to another
   */
  convertCurrency: async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> => {
    const response = await api.post<CurrencyConversion>("/currency/convert", {
      amount,
      fromCurrency,
      toCurrency,
    });
    return response.data;
  },

  /**
   * Clear currency caches (admin only)
   */
  clearCache: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/currency/clear-cache"
    );
    return response.data;
  },
};
