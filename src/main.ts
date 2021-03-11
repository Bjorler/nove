import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import {
  PORT,
  IS_DEVELOPMENT,
  KEY_FILE,
  CERT_FILE,
  API_PREFIX,
} from './config';

async function bootstrap() {
  let app;
  if (IS_DEVELOPMENT) {
    app = await NestFactory.create(AppModule);
  } else {
    const httpsOptions = {
      key: fs.readFileSync(KEY_FILE),
      cert: fs.readFileSync(CERT_FILE),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
  }

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("NOVEVE API's")
    .setDescription(
      'Press the schema option found at the top of each example to see more detail',
    )
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`/${API_PREFIX}/api`, app, document);

  const server = await app.listen(PORT);
  server.setTimeout(60000);
}
bootstrap();
