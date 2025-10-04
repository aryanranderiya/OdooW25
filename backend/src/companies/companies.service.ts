import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  async detectCurrency(countryName: string) {
    try {
      const encodedName = encodeURIComponent(countryName);
      const res = await axios.get(
        `https://restcountries.com/v3.1/name/${encodedName}?fullText=true&fields=currencies`,
      );

      const countries = res.data as any[];
      if (!countries || countries.length === 0) return 'USD';

      const country = countries[0];
      const currencies = country.currencies;

      if (!currencies || typeof currencies !== 'object') return 'USD';

      const currencyCode = Object.keys(currencies)[0];
      return currencyCode || 'USD';
    } catch {
      this.logger.warn(
        `Failed to detect currency for country "${countryName}", defaulting to USD`,
      );
      return 'USD';
    }
  }
}
