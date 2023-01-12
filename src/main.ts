import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remuve extra data of DTO - like Mongoose ODM
      forbidNonWhitelisted: true, // envia 1 error con las properties q NO estan definidas en DTO

      // Transforma la data antes q llegue a nuestros controllers - la transforma en base a lo q se espera
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
