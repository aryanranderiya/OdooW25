import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import * as fs from 'fs';
import PDFParser from 'pdf2json';

@Injectable()
export class OcrService {
  constructor() {}

  async processReceipt(filePath: string, mimeType: string) {
    try {
      const isImage = mimeType.startsWith('image/');
      const isPdf = mimeType === 'application/pdf';

      if (!isImage && !isPdf) {
        throw new Error('Unsupported file type for OCR processing');
      }

      let text = '';

      if (isPdf) {
        console.log('Extracting text directly from PDF...');
        text = await this.extractTextFromPdf(filePath);
      } else {
        // Process image files directly with OCR
        console.log('Starting OCR processing with Tesseract.js...');

        // Validate that the image file exists and is readable
        if (!fs.existsSync(filePath)) {
          throw new Error('Image file not found');
        }

        const {
          data: { text: ocrText },
        } = await Tesseract.recognize(filePath, 'eng', {
          logger: (m) => console.log(m),
        });

        text = ocrText;
      }

      console.log('Text extracted:', text);

      // Parse the extracted text to get structured data
      const parsedData = this.parseReceiptText(text);

      return {
        success: true,
        confidence: parsedData.confidence,
        amount: parsedData.amount,
        date: parsedData.date,
        vendor: parsedData.vendor,
        category: parsedData.category,
        rawData: {
          extractedText: text,
          confidence: parsedData.confidence,
        },
        extractedFields: parsedData.extractedFields,
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  private async extractTextFromPdf(pdfPath: string): Promise<string> {
    try {
      console.log('Reading PDF file for text extraction...');

      return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('PDF parsing error:', errData.parserError);
          reject(new Error(`PDF parsing failed: ${errData.parserError}`));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            // Extract text from all pages
            let extractedText = '';

            if (pdfData.Pages && pdfData.Pages.length > 0) {
              for (const page of pdfData.Pages) {
                if (page.Texts && page.Texts.length > 0) {
                  for (const textItem of page.Texts) {
                    if (textItem.R && textItem.R.length > 0) {
                      for (const textRun of textItem.R) {
                        if (textRun.T) {
                          // Decode URI-encoded text
                          const decodedText = decodeURIComponent(textRun.T);
                          extractedText += decodedText + ' ';
                        }
                      }
                    }
                  }
                  extractedText += '\n';
                }
              }
            }

            console.log('Raw PDF text extracted:', extractedText);

            // Clean up the text - remove extra whitespaces, normalize line breaks
            const cleanedText = extractedText
              .replace(/\r\n/g, '\n')
              .replace(/\r/g, '\n')
              .replace(/\s+/g, ' ')
              .trim();

            console.log('Cleaned PDF text:', cleanedText);

            resolve(cleanedText);
          } catch (error) {
            console.error('Error processing PDF data:', error);
            reject(new Error(`Failed to process PDF data: ${error.message}`));
          }
        });

        // Load and parse the PDF file
        try {
          void pdfParser.loadPDF(pdfPath);
        } catch (loadError) {
          reject(new Error(`Failed to load PDF: ${loadError.message}`));
        }
      });
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  private parseReceiptText(text: string) {
    // Parse extracted text to find structured data
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log('Parsed lines:', lines);

    // Extract amount (look for currency symbols and numbers)
    const amount = this.extractAmount(text);

    // Extract date
    const date = this.extractDate(text);

    // Extract vendor (usually the first few lines)
    const vendor = this.extractVendor(lines);

    // Extract category based on vendor/keywords
    const category = this.extractCategory(vendor, text);

    // Enhanced confidence for PDF text extraction (higher than OCR)
    const confidence = 0.95;

    return {
      amount,
      date,
      vendor,
      category,
      confidence,
      extractedFields: {
        total: amount,
        subtotal: this.extractSubtotal(text) || (amount ? amount * 0.9 : null),
        tax: this.extractTax(text) || (amount ? amount * 0.1 : null),
        paymentMethod: this.extractPaymentMethod(text),
        transactionId: this.extractTransactionId(text),
        address: this.extractAddress(text),
        phone: this.extractPhone(text),
        receiptNumber: this.extractReceiptNumber(text),
        items: this.extractItems(text),
      },
    };
  }

  private extractAmount(text: string): number | null {
    // Look for patterns like $XX.XX, €XX.XX, £XX.XX, etc.
    const amountPatterns = [
      /[$€£¥]\s*(\d+\.?\d*)/g,
      /(\d+\.\d{2})\s*[$€£¥]/g,
      /total[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
      /amount[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
      /(\d+\.\d{2})/g, // General decimal pattern
    ];

    for (const pattern of amountPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 10000) {
          // Reasonable range
          return amount;
        }
      }
    }
    return null;
  }

  private extractDate(text: string): Date | null {
    // Look for date patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/g, // MM/DD/YYYY
      /(\d{1,2}-\d{1,2}-\d{2,4})/g, // MM-DD-YYYY
      /(\d{4}-\d{1,2}-\d{1,2})/g, // YYYY-MM-DD
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi,
    ];

    for (const pattern of datePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        try {
          const date = new Date(match[0]);
          if (date.getTime() && date.getFullYear() > 2020) {
            return date;
          }
        } catch (e) {
          console.log('Date parsing error:', e);
          continue;
        }
      }
    }
    return null;
  }

  private extractVendor(lines: string[]): string | null {
    // Usually the vendor is in the first few lines
    // Look for lines that aren't addresses or numbers
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip lines that look like addresses, phone numbers, or pure numbers
      if (
        !line.match(/\d{3}-\d{3}-\d{4}/) && // phone
        !line.match(/^\d+\s+\w+\s+(st|ave|rd|blvd|dr)/i) && // address
        !line.match(/^\d+$/) && // pure number
        line.length > 2 &&
        line.length < 50
      ) {
        return line;
      }
    }
    return null;
  }

  private extractCategory(vendor: string | null, text: string): string | null {
    const categoryKeywords = {
      'Food & Dining': [
        'restaurant',
        'cafe',
        'coffee',
        'food',
        'dining',
        'starbucks',
        'mcdonald',
        'burger',
        'pizza',
      ],
      'Travel & Transportation': [
        'uber',
        'lyft',
        'taxi',
        'gas',
        'fuel',
        'station',
        'airline',
        'hotel',
      ],
      'Office Supplies': [
        'office',
        'depot',
        'staples',
        'supplies',
        'paper',
        'pen',
      ],
      'Software & Technology': [
        'software',
        'tech',
        'computer',
        'apple',
        'microsoft',
        'google',
      ],
      'Gas & Fuel': ['shell', 'exxon', 'bp', 'chevron', 'gas', 'fuel'],
      'Equipment & Hardware': ['home depot', 'lowes', 'hardware', 'tools'],
    };

    const searchText = (vendor + ' ' + text).toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => searchText.includes(keyword))) {
        return category;
      }
    }
    return null;
  }

  private extractPaymentMethod(text: string): string | null {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('credit') || lowerText.includes('card'))
      return 'Card';
    if (lowerText.includes('cash')) return 'Cash';
    if (lowerText.includes('debit')) return 'Debit Card';
    return null;
  }

  private extractTransactionId(text: string): string | null {
    const patterns = [
      /transaction[:\s]*([a-z0-9]+)/gi,
      /ref[:\s]*([a-z0-9]+)/gi,
      /id[:\s]*([a-z0-9]+)/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractAddress(text: string): string | null {
    // Look for address patterns
    const addressPattern =
      /(\d+\s+\w+\s+(st|ave|rd|blvd|dr|street|avenue|road|boulevard|drive)[,\s]*\w*[,\s]*\w*\s*\d*)/gi;
    const match = text.match(addressPattern);
    return match ? match[0] : null;
  }

  private extractPhone(text: string): string | null {
    const phonePattern =
      /(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{3}\.\d{3}\.\d{4})/g;
    const match = text.match(phonePattern);
    return match ? match[0] : null;
  }

  private extractSubtotal(text: string): number | null {
    const subtotalPatterns = [
      /subtotal[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
      /sub\s*total[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
      /sub[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
    ];

    for (const pattern of subtotalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 10000) {
          return amount;
        }
      }
    }
    return null;
  }

  private extractTax(text: string): number | null {
    const taxPatterns = [
      /tax[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
      /sales\s*tax[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
      /(\d+\.?\d*)\s*%\s*tax/gi,
      /tax\s*\([\d.]+%\)[:\s]*[$€£¥]?\s*(\d+\.?\d*)/gi,
    ];

    for (const pattern of taxPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (amount >= 0 && amount < 1000) {
          return amount;
        }
      }
    }
    return null;
  }

  private extractReceiptNumber(text: string): string | null {
    const receiptPatterns = [
      /receipt[:\s#]*([a-z0-9]+)/gi,
      /receipt\s*#[:\s]*([a-z0-9]+)/gi,
      /ref[:\s#]*([a-z0-9]+)/gi,
      /order[:\s#]*([a-z0-9]+)/gi,
    ];

    for (const pattern of receiptPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 3) {
        return match[1];
      }
    }
    return null;
  }

  private extractItems(text: string): Array<{ name: string; price: number }> {
    const lines = text.split('\n').map((line) => line.trim());
    const items: Array<{ name: string; price: number }> = [];

    for (const line of lines) {
      // Look for lines with item name and price
      // Pattern: "Item Name $X.XX" or "Item Name X.XX"
      const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})$/;
      const match = line.match(itemPattern);

      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2]);

        // Filter out lines that look like totals, taxes, etc.
        if (
          !name.toLowerCase().includes('total') &&
          !name.toLowerCase().includes('tax') &&
          !name.toLowerCase().includes('subtotal') &&
          name.length > 2 &&
          price > 0 &&
          price < 1000
        ) {
          items.push({ name, price });
        }
      }
    }

    return items;
  }

  // Method to validate OCR results and handle errors
  validateOcrResult(ocrResult: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate amount
    if (!ocrResult.amount || ocrResult.amount <= 0) {
      errors.push('Invalid or missing amount');
    } else if (ocrResult.amount > 10000) {
      warnings.push('Unusually high amount detected, please verify');
    }

    // Validate date
    if (!ocrResult.date) {
      warnings.push('Date not found in receipt');
    } else {
      const receiptDate = new Date(ocrResult.date);
      const now = new Date();
      const oneYearAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );

      if (receiptDate > now) {
        warnings.push('Receipt date is in the future');
      } else if (receiptDate < oneYearAgo) {
        warnings.push('Receipt is more than one year old');
      }
    }

    // Validate vendor
    if (!ocrResult.vendor || ocrResult.vendor.trim().length < 2) {
      warnings.push('Vendor name unclear or missing');
    }

    // Check confidence levels
    if (ocrResult.confidence < 0.7) {
      warnings.push('Low OCR confidence, manual verification recommended');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
