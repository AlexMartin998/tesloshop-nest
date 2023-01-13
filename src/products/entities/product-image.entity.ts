import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn() // autoincremental
  id: number;

  @Column('text') // obligatoria
  url: string;

  // // Relaciones: Muchas imgs pueden pertenecer a 1 Product  -- Se crea en esta tabla
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
