import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true, nullable: false })
  title: string;

  @Column('numeric', { default: 0 })
  // @Column('decimal', { precision: 5, scale: 3 })
  price: number;

  @Column('text')
  description: string;

  // slug para url friendly
  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;
}
