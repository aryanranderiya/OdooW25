import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface CountryCurrency {
  country: string;
  currencies: {
    code: string;
    name: string;
    symbol: string;
  }[];
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private countriesCache: CountryCurrency[] | null = null;
  private countriesCacheExpiry: number = 0;
  private exchangeRatesCache: Map<string, ExchangeRates> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for countries
  private readonly EXCHANGE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for exchange rates

  /**
   * Fetches all countries with their currencies from the REST Countries API
   * Results are cached for 24 hours
   */
  async getAllCountriesWithCurrencies(): Promise<CountryCurrency[]> {
    // Check if cache is valid
    if (this.countriesCache && Date.now() < this.countriesCacheExpiry) {
      return this.countriesCache;
    }

    try {
      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,currencies',
        {
          timeout: 10000,
        },
      );

      const countries: CountryCurrency[] = response.data
        .map((country: any) => {
          const countryName = country.name?.common || 'Unknown';
          const currencies = country.currencies || {};

          const currencyList = Object.entries(currencies).map(
            ([code, details]: [string, any]) => ({
              code,
              name: details.name || code,
              symbol: details.symbol || code,
            }),
          );

          return {
            country: countryName,
            currencies: currencyList,
          };
        })
        .filter((c: CountryCurrency) => c.currencies.length > 0)
        .sort((a: CountryCurrency, b: CountryCurrency) =>
          a.country.localeCompare(b.country),
        );

      // Update cache
      this.countriesCache = countries;
      this.countriesCacheExpiry = Date.now() + this.CACHE_DURATION;

      this.logger.log(`Fetched ${countries.length} countries with currencies`);
      return countries;
    } catch (error) {
      this.logger.error('Failed to fetch countries/currencies', error);

      // Return cache if available, even if expired
      if (this.countriesCache) {
        this.logger.warn('Returning expired cache due to API error');
        return this.countriesCache;
      }

      throw new Error('Failed to fetch currencies data');
    }
  }

  /**
   * Gets all unique currencies from all countries
   */
  async getAllCurrencies(): Promise<
    { code: string; name: string; symbol: string }[]
  > {
    const countries = await this.getAllCountriesWithCurrencies();
    const currencyMap = new Map<
      string,
      { code: string; name: string; symbol: string }
    >();

    countries.forEach((country) => {
      country.currencies.forEach((currency) => {
        if (!currencyMap.has(currency.code)) {
          currencyMap.set(currency.code, currency);
        }
      });
    });

    return Array.from(currencyMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }

  /**
   * Fetches exchange rates for a given base currency
   * Results are cached for 1 hour
   */
  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    const cacheKey = baseCurrency.toUpperCase();
    const cached = this.exchangeRatesCache.get(cacheKey);

    // Check if cache is valid
    if (
      cached &&
      Date.now() - cached.timestamp < this.EXCHANGE_CACHE_DURATION
    ) {
      return cached;
    }

    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${cacheKey}`,
        {
          timeout: 10000,
        },
      );

      const exchangeRates: ExchangeRates = {
        base: response.data.base,
        rates: response.data.rates,
        timestamp: Date.now(),
      };

      // Update cache
      this.exchangeRatesCache.set(cacheKey, exchangeRates);

      this.logger.log(`Fetched exchange rates for ${cacheKey}`);
      return exchangeRates;
    } catch (error) {
      this.logger.error(
        `Failed to fetch exchange rates for ${cacheKey}`,
        error,
      );

      // Return cached data if available, even if expired
      if (cached) {
        this.logger.warn(
          'Returning expired exchange rate cache due to API error',
        );
        return cached;
      }

      throw new Error(`Failed to fetch exchange rates for ${cacheKey}`);
    }
  }

  /**
   * Converts an amount from one currency to another
   * @param amount The amount to convert
   * @param fromCurrency Source currency code
   * @param toCurrency Target currency code
   * @returns Object containing convertedAmount and exchangeRate
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ convertedAmount: number; exchangeRate: number }> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    // If same currency, no conversion needed
    if (from === to) {
      return {
        convertedAmount: amount,
        exchangeRate: 1.0,
      };
    }

    try {
      // Get exchange rates with source currency as base
      const rates = await this.getExchangeRates(from);

      // Get the exchange rate for target currency
      const exchangeRate = rates.rates[to];

      if (!exchangeRate) {
        this.logger.warn(
          `Exchange rate not found for ${from} to ${to}, using 1:1`,
        );
        return {
          convertedAmount: amount,
          exchangeRate: 1.0,
        };
      }

      const convertedAmount = amount * exchangeRate;

      return {
        convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimals
        exchangeRate: Math.round(exchangeRate * 1000000) / 1000000, // Round to 6 decimals
      };
    } catch (error) {
      this.logger.error(`Error converting ${from} to ${to}, using 1:1`, error);
      return {
        convertedAmount: amount,
        exchangeRate: 1.0,
      };
    }
  }

  /**
   * Clears all caches (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.countriesCache = null;
    this.countriesCacheExpiry = 0;
    this.exchangeRatesCache.clear();
    this.logger.log('Currency caches cleared');
  }
}
