interface ExchangeRates {
  [key: string]: number;
}

interface CacheEntry {
  rates: ExchangeRates;
  timestamp: number;
  baseCurrency: string;
}

const CACHE_DURATION = 1000 * 60 * 60;
let ratesCache: CacheEntry | null = null;

async function fetchExchangeRates(
  baseCurrency: string
): Promise<ExchangeRates> {
  const now = Date.now();

  if (
    ratesCache &&
    ratesCache.baseCurrency === baseCurrency &&
    now - ratesCache.timestamp < CACHE_DURATION
  ) {
    return ratesCache.rates;
  }

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();

    ratesCache = {
      rates: data.rates,
      timestamp: now,
      baseCurrency,
    };

    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    if (ratesCache) {
      return ratesCache.rates;
    }

    return { [baseCurrency]: 1 };
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await fetchExchangeRates(toCurrency);

    const rate = rates[fromCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency}, using 1:1`);
      return amount;
    }

    const convertedAmount = amount / rate;
    return Number(convertedAmount.toFixed(2));
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount;
  }
}

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1.0;
  }

  try {
    const rates = await fetchExchangeRates(toCurrency);

    const rate = rates[fromCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency}, using 1:1`);
      return 1.0;
    }

    return Number((1 / rate).toFixed(4));
  } catch (error) {
    console.error("Error getting exchange rate:", error);
    return 1.0;
  }
}
