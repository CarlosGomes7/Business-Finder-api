import { Module } from '@nestjs/common';
import { AiLeadsController } from './ai-leads.controller';
import { AiLeadsService } from './ai-leads.service';

@Module({
  controllers: [AiLeadsController],
  providers: [AiLeadsService],
  exports: [AiLeadsService]
})

export class AiLeadsModule {}


// ============================================
// CÓMO PROBAR TU API
// ============================================

/*
1. Inicia tu servidor:
   npm run start:dev

2. El servidor debe estar corriendo en http://localhost:3000

3. PRUEBA 1: Test endpoint
   curl -X POST http://localhost:3000/ai-leads/test

4. PRUEBA 2: Con JSON (usando Postman o Thunder Client)
   POST http://localhost:3000/ai-leads/process-json
   Headers: Content-Type: application/json
   Body:
   {
     "leads": [
       {
         "Name": "Hospedaje La Sirenita",
         "Address": "San Luis de Shuaro",
         "Phone": "951852983",
         "Types": "lodging",
         "Rating": "4.0",
         "TotalRatings": "5"
       }
     ]
   }

5. PRUEBA 3: Con CSV
   POST http://localhost:3000/ai-leads/process-csv
   Body: form-data
   Key: file
   Value: [selecciona tu archivo CSV]

6. Respuesta esperada:
   {
     "success": true,
     "total": 1,
     "statistics": {
       "total": 1,
       "highPriority": 0,
       "mediumPriority": 1,
       "lowPriority": 0,
       "withPhone": 1,
       "withoutPhone": 0
     },
     "data": [
       {
         "Name": "Hospedaje La Sirenita",
         "Address": "San Luis de Shuaro",
         "Phone": "951852983",
         "Types": "lodging",
         "Rating": "4.0",
         "TotalRatings": "5",
         "businessType": "hotel",
         "recommendedPackage": "Crece",
         "recommendedServices": [
           "Automatización de Reservas",
           "Chatbot de Atención"
         ],
         "personalizedMessage": "Vi que Hospedaje La Sirenita...",
         "priority": "medium",
         "estimatedBudget": "S/ 1100 inicial + S/ 1930/mes"
       }
     ]
   }
*/
