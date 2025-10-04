import React, { useState, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCurrencyOptions,
  searchCurrencies,
  POPULAR_CURRENCIES,
} from "@/lib/currency";

interface CurrencySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencySelect({
  value,
  onValueChange,
  placeholder,
  className,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allCurrencies = useMemo(() => getCurrencyOptions(), []);
  const filteredCurrencies = useMemo(() => {
    return searchQuery ? searchCurrencies(searchQuery) : allCurrencies;
  }, [searchQuery, allCurrencies]);

  const popularCurrencies = useMemo(
    () => allCurrencies.filter((c) => POPULAR_CURRENCIES.includes(c.code)),
    [allCurrencies]
  );

  const otherCurrencies = useMemo(() => {
    if (searchQuery) {
      return filteredCurrencies;
    }
    return filteredCurrencies.filter(
      (c) => !POPULAR_CURRENCIES.includes(c.code)
    );
  }, [searchQuery, filteredCurrencies]);

  const selectedCurrency = allCurrencies.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCurrency ? (
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {selectedCurrency.symbol}
              </span>
              <span>{selectedCurrency.code}</span>
              <span className="text-muted-foreground">
                - {selectedCurrency.name}
              </span>
            </span>
          ) : (
            placeholder || "Select currency..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search currencies..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>

            {!searchQuery && popularCurrencies.length > 0 && (
              <CommandGroup heading="Popular Currencies">
                {popularCurrencies.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    value={currency.code}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue.toUpperCase());
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === currency.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-sm w-8">
                        {currency.symbol}
                      </span>
                      <span className="font-semibold">{currency.code}</span>
                      <span className="text-muted-foreground truncate">
                        {currency.name}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {otherCurrencies.length > 0 && (
              <CommandGroup
                heading={searchQuery ? "Results" : "All Currencies"}
              >
                {otherCurrencies.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    value={currency.code}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue.toUpperCase());
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === currency.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-sm w-8">
                        {currency.symbol}
                      </span>
                      <span className="font-semibold">{currency.code}</span>
                      <span className="text-muted-foreground truncate">
                        {currency.name}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
