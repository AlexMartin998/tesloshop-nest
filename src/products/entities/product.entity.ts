import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true, nullable: false })
  title: string;

  @Column('numeric', { nullable: false, default: 0 })
  // @Column('decimal', { precision: 5, scale: 3 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  // slug para url friendly
  @Column('text', { unique: true, nullable: false })
  slug: string;

  @Column('int', { nullable: false, default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;
}
