import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PORT } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("noveve-api")
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle("NOVEVE API's").setDescription("Press the schema option found at the top of each example to see more detail")
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/noveve-api/api', app, document);

  await app.listen(PORT);
}
bootstrap();
