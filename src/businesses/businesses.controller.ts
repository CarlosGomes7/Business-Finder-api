import { Controller, Post, Get, Body, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { BusinessesService } from './businesses.service';
import { SearchBusinessDto } from './dto/search-business.dto/search-business.dto';
import { ExportRequestDto } from './dto/business-response.dto/business-response.dto';

@Controller('api/businesses')
export class BusinessesController {
    constructor(private businessesService: BusinessesService) {}

    @Post('search')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute per IP
    async searchBusinesses(@Body() searchDto: SearchBusinessDto) {
        return this.businessesService.searchBusinesses(searchDto);
    }

    @Get('types')
    getBusinessTypes() {
        return this.businessesService.getBusinessTypes();
    }

    @Post('export')
    async exportBusinesses(
        @Body() exportDto: ExportRequestDto,
        @Res() res: Response
    ): Promise<void> {
        try {
            if (exportDto.format === 'csv') {
                const csv = this.businessesService.convertToCSV(exportDto.businesses);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=businesses.csv');
                res.status(HttpStatus.OK).send(csv);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=businesses.json');
                res.status(HttpStatus.OK).json(exportDto.businesses);
            }
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Export failed',
                error: error.message,
            });
        }
    }
}