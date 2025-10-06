import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
   app.enableCors({
    origin: [ 
      'https://business-finder.online',
      'https://www.business-finder.online',
      'http://localhost:4200' // Para desarrollo local
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
// Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

   const config = new DocumentBuilder()
    .setTitle('API de Leads')
    .setDescription('Documentación de la API para procesamiento de leads')
    .setVersion('1.0')
    .addTag('leads') // Puedes agregar más etiquetas si tienes otros módulos
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
