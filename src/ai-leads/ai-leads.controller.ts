import { 
  Controller, 
  Post, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  BadRequestException, 
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiLeadsService } from './ai-leads.service';
import { ProcessLeadsDto } from './dto/process-leads.dto';
import { Lead } from './interfaces/lead.interface';
import * as Papa from 'papaparse';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('leads') 
@Controller('api/leads')
export class AiLeadsController {

  constructor(private readonly aiLeadsService: AiLeadsService) {}

  /**
   * POST /ai-leads/process-json
   * Procesa leads enviados como JSON
   * 
   * Body ejemplo:
   * {
   *   "leads": [
   *     {
   *       "Name": "Hotel Example",
   *       "Address": "Calle 123",
   *       "Phone": "987654321",
   *       "Types": "lodging, hotel",
   *       "Rating": "4.5",
   *       "TotalRatings": "10"
   *     }
   *   ]
   * }
   */
  @Post('process-json')
  @ApiResponse({ status: 200, description: 'Procesa leads en formato JSON' })
  async processJsonLeads(@Body() data: ProcessLeadsDto) {
    try {
      if (!data.leads || !Array.isArray(data.leads)) {
        throw new BadRequestException('El campo "leads" debe ser un array');
      }

      if (data.leads.length === 0) {
        throw new BadRequestException('El array de leads está vacío');
      }

      const processedLeads = await this.aiLeadsService.processLeads(data.leads);
      const statistics = this.aiLeadsService.getStatistics(processedLeads);

      return {
        success: true,
        total: processedLeads.length,
        statistics,
        data: processedLeads
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /ai-leads/process-csv
   * Procesa un archivo CSV
   * 
   * Usar form-data con key "file"
   */
  @Post('process-csv')
  @UseInterceptors(FileInterceptor('file'))
  async processCsvLeads(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No se recibió ningún archivo');
      }

      // Validar que sea CSV
      if (!file.originalname.endsWith('.csv')) {
        throw new BadRequestException('El archivo debe ser CSV');
      }

      const csvText = file.buffer.toString('utf-8');
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              if (!results.data || results.data.length === 0) {
                throw new BadRequestException('El archivo CSV está vacío');
              }

              // Convertir unknown[] a Lead[]
              const leads = results.data as Lead[];
              
              const processedLeads = await this.aiLeadsService.processLeads(leads);
              const statistics = this.aiLeadsService.getStatistics(processedLeads);

              resolve({
                success: true,
                total: processedLeads.length,
                statistics,
                data: processedLeads
              });
            } catch (error) {
              reject(new BadRequestException(error.message));
            }
          },
          error: (error) => {
            reject(new BadRequestException(`Error al parsear CSV: ${error.message}`));
          }
        });
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /ai-leads/test
   * Endpoint de prueba para verificar que todo funciona
   */
  @Get('test')
  async test() {
    const testLead = {
      Name: "Hotel Test",
      Address: "Calle Test 123",
      Phone: "987654321",
      Types: "lodging, hotel",
      Rating: "4.5",
      TotalRatings: "10"
    };

    const processed = await this.aiLeadsService.processLeads([testLead]);

    return {
      success: true,
      message: '✅ El servicio está funcionando correctamente',
      example: processed[0]
    };
  }
}