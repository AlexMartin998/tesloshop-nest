import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3, { message: 'Some custom message!' })
  @ApiProperty({
    description: 'Product title (unique)',
    nullable: false,
    minLength: 3,
  })
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty()
  price?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @Matches(/^[\w-]+$/, { message: 'Slug format is incorrect' })
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty()
  stock?: number;

  @IsString({ each: true }) // validar data type del []
  @IsArray()
  @ApiProperty()
  sizes: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  tags?: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  @ApiProperty()
  gender: string;

  // relaciones
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  images?: string[];
}
