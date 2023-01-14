import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { EnvConfiguration } from './config/app.config';
import { FilesModule } from './files/files.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],

      // // Con esto evitamos tener q importar el 'ConfigModule' en c/module q utilize EnvV
      // isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,

      autoLoadEntities: true, //cree en auto las entities
      synchronize: true, // solo en Dev - actua ante un cambio en las entities - prod: false
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
