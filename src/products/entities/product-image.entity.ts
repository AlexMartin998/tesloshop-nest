import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn() // autoincremental
  id: number;

  @Column('text') // obligatoria
  url: string;

  // Relaciones: Muchas imgs pueden pertenecer a 1 Product  -- Se crea en esta tabla
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne https://orkhan.gitbook.io/typeorm/docs/relations#joincolumn-options
  product: Product;
}
