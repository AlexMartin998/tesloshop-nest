import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    // query runner
    private readonly dataSource: DataSource,
  ) {}

  // TODO: crear imgs basado en el id como en SQL: https://www.udemy.com/course/nest-framework/learn/lecture/33068696#questions/18840882
  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,

        images: images.map((img) =>
          this.productImageRepository.create({ url: img }),
        ),

        user,
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,

      relations: {
        images: true,
      },
    });

    // return products.map(({ images, ...rest }) => ({
    //   ...rest,
    //   images: images.map((img) => img.url),
    // }));

    return products.reduce((acc, { images, ...rest }) => {
      acc.push({ ...rest, images: images.map((img) => img.url) });
      return acc;
    }, []);
  }

  async findOne(term: string) {
    // const product = await this.productRepository.findOne({ where: { id } });
    // const product = await this.productRepository.findOneBy({ id });
    let product: Product;
    if (isUUID(term))
      product = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder =
        this.productRepository.createQueryBuilder('prod_alias');
      // select * from products where slug='x' or title='y'
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod_alias.images', 'prodImages_alias')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with '${term}' not found`);

    return product;
  }

  // async findOnePlain(term: string) {
  //   const { images = [], ...rest } = await this.findOne(term);
  //   return { ...rest, images: images.map((img) => img.url) };
  // }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...rest } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...rest,
    });
    if (!product)
      throw new NotFoundException(`Product with id '${id} not found`);

    // Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // imgs - si vienen borra todas las imgs en DB y agregar
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      } else {
        // requiere la consulta x la relacion
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }
      product.user = user;
      await queryRunner.manager.save(product); // aun no impacta la db espera al commit
      await queryRunner.commitTransaction(); // persiste si no hay errores
      await queryRunner.release(); // elimina el queryRunner

      return product;
      // return await this.productRepository.save(product); // sun queryRunner ni relaciones
    } catch (error) {
      // si da error en la transaccion
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }
  /*   async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const result = await this.productRepository
        .createQueryBuilder()
        .update({
          id: id,
          ...updateProductDto,

          images: [],
        })
        .where({ id })
        .returning('*')
        .execute();

      return result.raw[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  } */

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check serve logs',
    );
  }

  // para los seeds
  async deleteAllProducts() {
    if (process.env.NODE_ENV !== 'dev')
      throw new BadRequestException(
        'This action can only be executed in dev mode',
      );

    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
