import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  async detectCurrency(countryName: string) {
    try {
      const res = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,currencies',
      );
      const list = res.data as any[];
      const matched = list.find((c) => {
        if (!c?.name) return false;
        const common = c.name.common || c.name;
        return (
          String(common).toLowerCase() === String(countryName).toLowerCase()
        );
      });
      if (!matched) return 'USD';
      const currencies = matched.currencies;
      if (!currencies) return 'USD';
      const code = Object.keys(currencies)[0];
      return code || 'USD';
    } catch {
      this.logger.warn('Failed to detect currency, defaulting to USD');
      return 'USD';
    }
  }
}
