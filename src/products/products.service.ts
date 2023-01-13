import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  // TODO: crear imgs basado en el id como en SQL: https://www.udemy.com/course/nest-framework/learn/lecture/33068696#questions/18840882
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...createProductDto,

        images: images.map((img) =>
          this.productImageRepository.create({ url: img }),
        ),
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

    return products;

    // // ya no es necesaria x @Transform - @UseInterceptors(ClassSerializerInterceptor)
    // return products.map(({ images, ...rest }) => ({
    //   ...rest,
    //   images: images.map((img) => img.url),
    // }));
    // return products.reduce((acc, { images, ...rest }) => {
    //   acc.push({ ...rest, images: images.map((img) => img.url) });
    //   return acc;
    // }, []);
  }

  async findOne(term: string) {
    // const product = await this.productRepository.findOne({ where: { id } });
    // const product = await this.productRepository.findOneBy({ id });
    let product: Product;
    if (isUUID(term))
      product = await this.productRepository.findOneBy({ id: term }); // <- eager
    else {
      const queryBuilder =
        this.productRepository.createQueryBuilder('prod_alias');
      // select * from products where slug='x' or title='y'
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod_alias.images', 'prodImages_alias') // traer las imgs
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with '${term}' not found`);

    return product;
  }

  /* Se usa en el controller, pero con el @Transform ya no es necesaria esta logica ni la de aplanar
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return { ...rest, images: images.map((img) => img.url) };
  } 
  */

  // async update(id: string, updateProductDto: UpdateProductDto) {
  //   const product = await this.productRepository.preload({
  //     id: id,
  //     ...updateProductDto,
  //   });
  //   if (!product)
  //     throw new NotFoundException(`Product with id '${id} not found`);

  //   try {
  //     return await this.productRepository.save(product);
  //   } catch (error) {
  //     this.handleDBExceptions(error);
  //   }
  // }
  async update(id: string, updateProductDto: UpdateProductDto) {
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
  }

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
}
