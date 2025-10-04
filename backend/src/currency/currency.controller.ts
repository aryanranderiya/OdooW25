import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

export interface ConvertCurrencyDto {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('countries')
  async getCountriesWithCurrencies() {
    return this.currencyService.getAllCountriesWithCurrencies();
  }

  @Get('list')
  async getAllCurrencies() {
    return this.currencyService.getAllCurrencies();
  }

  @Get('rates')
  async getExchangeRates(@Query('base') baseCurrency: string = 'USD') {
    return this.currencyService.getExchangeRates(baseCurrency);
  }

  @Post('convert')
  async convertCurrency(@Body() dto: ConvertCurrencyDto) {
    return this.currencyService.convertCurrency(
      dto.amount,
      dto.fromCurrency,
      dto.toCurrency,
    );
  }

  @Post('clear-cache')
  clearCache() {
    this.currencyService.clearCache();
    return { message: 'Currency caches cleared successfully' };
  }
}
