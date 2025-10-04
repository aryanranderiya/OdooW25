import useSWR from "swr";
import { currencyApi, Currency, CurrencyConversion } from "@/lib/currency-api";
import { useState, useEffect } from "react";

/**
 * Hook to fetch all available currencies
 */
export function useCurrencies() {
  const { data, error, isLoading } = useSWR<Currency[]>(
    "/currency/list",
    currencyApi.getAllCurrencies,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  return {
    currencies: data || [],
    isLoading,
    error,
  };
}

/**
 * Hook to convert currency with real-time preview
 */
export function useCurrencyConversion(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if same currency or no amount
    if (!amount || amount <= 0 || fromCurrency === toCurrency) {
      setConversion({
        convertedAmount: amount,
        exchangeRate: 1.0,
      });
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsConverting(true);
      setError(null);

      try {
        const result = await currencyApi.convertCurrency(
          amount,
          fromCurrency,
          toCurrency
        );
        if (!cancelled) {
          setConversion(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Conversion failed"));
          setConversion({
            convertedAmount: amount,
            exchangeRate: 1.0,
          });
        }
      } finally {
        if (!cancelled) {
          setIsConverting(false);
        }
      }
    }, 500); // Debounce for 500ms

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amount, fromCurrency, toCurrency]);

  return {
    conversion,
    isConverting,
    error,
  };
}
