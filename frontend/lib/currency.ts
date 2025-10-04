import currencyCodes from "currency-codes";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  countries: string[];
}

// Get all available currencies from the currency-codes library
export const getAllCurrencies = (): CurrencyOption[] => {
  return currencyCodes.data
    .filter((currency) => currency.currency && currency.code)
    .map((currency) => ({
      code: currency.code,
      name: currency.currency,
      symbol: getSymbolForCurrency(currency.code),
      countries: currency.countries || [],
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
};

// Helper function to get currency symbol
const getSymbolForCurrency = (code: string): string => {
  const symbolMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    ZAR: "R",
    BRL: "R$",
    MXN: "$",
    KRW: "₩",
    THB: "฿",
    RUB: "₽",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    TRY: "₺",
    ILS: "₪",
    AED: "د.إ",
    SAR: "ر.س",
    QAR: "ر.ق",
    KWD: "د.ك",
    BHD: "ب.د",
    OMR: "ر.ع.",
    JOD: "د.ا",
    LBP: "ل.ل",
    EGP: "ج.م",
    MAD: "د.م.",
    DZD: "د.ج",
    TND: "د.ت",
    LYD: "ل.د",
    PKR: "₨",
    BDT: "৳",
    LKR: "₨",
    NPR: "₨",
    MMK: "K",
    KHR: "៛",
    LAK: "₭",
    VND: "₫",
    IDR: "Rp",
    MYR: "RM",
    PHP: "₱",
    TWD: "NT$",
    KZT: "₸",
    UZS: "лв",
    AMD: "֏",
    GEL: "₾",
    AZN: "₼",
    MDL: "L",
    UAH: "₴",
    BYN: "Br",
    BGN: "лв",
    RON: "lei",
    HRK: "kn",
    RSD: "дин.",
    BAM: "КМ",
    MKD: "ден",
    ALL: "L",
    XDR: "SDR",
    XAG: "oz t",
    XAU: "oz t",
    XPD: "oz t",
    XPT: "oz t",
  };

  return symbolMap[code] || code;
};

// Popular currencies that should appear at the top
export const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "SGD",
  "HKD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "ZAR",
  "BRL",
  "MXN",
  "KRW",
  "THB",
];

// Get popular currencies first, then all others
export const getCurrencyOptions = (): CurrencyOption[] => {
  const allCurrencies = getAllCurrencies();
  const currencyMap = new Map(allCurrencies.map((c) => [c.code, c]));

  const popularCurrencyOptions = POPULAR_CURRENCIES.map((code) =>
    currencyMap.get(code)
  ).filter((currency): currency is CurrencyOption => currency !== undefined);

  const otherCurrencies = allCurrencies.filter(
    (currency) => !POPULAR_CURRENCIES.includes(currency.code)
  );

  return [...popularCurrencyOptions, ...otherCurrencies];
};

// Format currency display with symbol
export const formatCurrencyDisplay = (
  code: string,
  amount?: number
): string => {
  const currency = getAllCurrencies().find((c) => c.code === code);
  if (!currency) return code;

  if (amount !== undefined) {
    return `${currency.symbol} ${amount.toLocaleString()} ${code}`;
  }

  return `${currency.symbol} ${code} - ${currency.name}`;
};

// Get currency symbol
export const getCurrencySymbol = (code: string): string => {
  const currency = getAllCurrencies().find((c) => c.code === code);
  return currency?.symbol || code;
};

// Search currencies by code or name
export const searchCurrencies = (query: string): CurrencyOption[] => {
  if (!query.trim()) return getCurrencyOptions();

  const lowerQuery = query.toLowerCase();
  return getCurrencyOptions().filter(
    (currency) =>
      currency.code.toLowerCase().includes(lowerQuery) ||
      currency.name.toLowerCase().includes(lowerQuery)
  );
};
