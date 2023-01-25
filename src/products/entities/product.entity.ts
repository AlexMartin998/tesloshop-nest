import { Transform } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ProductImage } from './';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  // @Column('decimal', { precision: 5, scale: 3 })
  price: number;

  @Column('text', { nullable: true })
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

  @Column('text', { array: true, default: [] })
  tags: string[];

  // // Relaciones images: 1 Product puede tener Muchas Images  -  Se crea en ProductImg
  // Transforma la data antes de ser enviada como response
  @Transform(({ value }) => {
    return value.map((image: ProductImage) => image.url);
  })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,

    // cargara las imgs con cualqueir find*: https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations
    eager: true,
  })
  images?: ProductImage[];

  // crea en esta tabla el user_id
  @ManyToOne(
    () => User,
    (user) => user.product,
    // carga en auto la relacion
    { eager: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'user_id' }) // this decorator is optional for @ManyToOne, but required for @OneToOne
  user: User;

  // // Solo se llaman con el  .save()
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) this.slug = this.title;

    this.slug = this.cleanSlug(this.slug);
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.cleanSlug(this.slug);
  }

  private cleanSlug(slug: string) {
    return slug.toLowerCase().trim().replaceAll(' ', '_').replaceAll("'", '');
  }
}
