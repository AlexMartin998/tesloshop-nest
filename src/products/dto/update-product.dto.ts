// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// export class UpdateProductDto extends PartialType(CreateProductDto) {}
// // para q tome la doc del q extiende
export class UpdateProductDto extends PartialType(CreateProductDto) {}
