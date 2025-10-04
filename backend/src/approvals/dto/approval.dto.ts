import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApprovalRuleType } from '@prisma/client';

export class ApproveRejectDto {
  @IsString()
  comment?: string;
}

export class CreateApprovalStepDto {
  @IsNumber()
  sequence: number;

  @IsString()
  approverId: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class CreateApprovalRuleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ApprovalRuleType)
  ruleType: ApprovalRuleType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : parseFloat(value),
  )
  minAmount?: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : parseFloat(value),
  )
  maxAmount?: number | null;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : parseInt(value),
  )
  percentageThreshold?: number | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  specificApproverId?: string | null;

  @IsBoolean()
  @IsOptional()
  requireManagerFirst?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateApprovalStepDto)
  @IsOptional()
  approvalSteps?: CreateApprovalStepDto[];
}

export class UpdateApprovalRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : parseFloat(value),
  )
  minAmount?: number | null;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : parseFloat(value),
  )
  maxAmount?: number | null;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : parseInt(value),
  )
  percentageThreshold?: number | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  specificApproverId?: string | null;

  @IsBoolean()
  @IsOptional()
  requireManagerFirst?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateApprovalStepDto)
  @IsOptional()
  approvalSteps?: CreateApprovalStepDto[];
}
