import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],

  imports: [TypeOrmModule.forFeature([Product, ProductImage]), AuthModule],
  exports: [
    ProductsService,

    // // Suele ser comun para usar los Repositorios de este Module en uno externo
    // TypeOrmModule
  ],
})
export class ProductsModule {}
