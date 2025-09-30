
import { IsArray, IsOptional, IsString } from 'class-validator';

export class BusinessTypeDto {
  value: string;
  label: string;
}

export class ExportRequestDto {
  @IsArray()
  businesses: any[];

  @IsOptional()
  @IsString()
  format?: 'csv' | 'json' = 'json';
}