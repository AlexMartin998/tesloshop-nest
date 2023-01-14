import { Logger, NotFoundException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Get EnvV
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('port');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remuve extra data of DTO - like Mongoose ODM
      forbidNonWhitelisted: true, // envia 1 error con las properties q NO estan definidas en DTO
    }),
  );

  // Si se sirve static content, ya q el middleware de servir ese contenido se ejecuta antes del notfound de nest <- PERO sobrescribe los notfound en nuestros services
  // app.use(() => {
  //   throw new NotFoundException();
  // });

  await app.listen(PORT);
  logger.log(`App running on port ${PORT}`);
}
bootstrap();
