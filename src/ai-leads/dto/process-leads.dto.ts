import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Lead, ProcessedLead } from '../interfaces/lead.interface';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessLeadsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @ApiProperty({ description: 'Leads' })
  leads: Lead[];
}

export class ProcessedLeadResponseDto {
  total: number;
  processed: ProcessedLead[];
  statistics: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    withPhone: number;
    withoutPhone: number;
  };
} 