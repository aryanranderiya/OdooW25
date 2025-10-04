import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Expense title/description' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Additional description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Original amount of the expense' })
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  originalAmount: number;

  @ApiProperty({ description: 'Original currency code' })
  @IsNotEmpty()
  @IsString()
  originalCurrency: string;

  @ApiProperty({ description: 'Date of the expense' })
  @IsDateString()
  @Type(() => Date)
  expenseDate: Date;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateExpenseDto {
  @ApiProperty({ description: 'Expense title/description', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Additional description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Original amount of the expense',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  originalAmount?: number;

  @ApiProperty({ description: 'Original currency code', required: false })
  @IsOptional()
  @IsString()
  originalCurrency?: string;

  @ApiProperty({ description: 'Date of the expense', required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expenseDate?: Date;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UploadReceiptsDto {
  @ApiProperty({
    description: 'Expense ID to associate receipts with',
    required: false,
  })
  @IsOptional()
  @IsString()
  expenseId?: string;
}
