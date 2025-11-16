import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { APP_CONFIG } from './common/constants/app.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(APP_CONFIG.server.globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: APP_CONFIG.validation.whitelist,
      forbidNonWhitelisted: APP_CONFIG.validation.forbidNonWhitelisted,
      transform: APP_CONFIG.validation.transform,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(APP_CONFIG.swagger.title)
    .setDescription(APP_CONFIG.swagger.description)
    .setVersion(APP_CONFIG.swagger.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    `${APP_CONFIG.server.globalPrefix}/${APP_CONFIG.swagger.path}`,
    app,
    document,
  );

  await app.listen(process.env.PORT ?? APP_CONFIG.server.defaultPort);
}
bootstrap();
