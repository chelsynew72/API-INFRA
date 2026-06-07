import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ProductEntity } from '../../database/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto, PaginatedResult } from '../../common/pipes/pagination.dto';
import { UserEntity } from '../../database/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_TTL = 60;
  private readonly CACHE_PREFIX = 'product:';

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async create(dto: CreateProductDto, user: UserEntity): Promise<ProductEntity> {
    const product = this.productRepo.create({ ...dto, createdById: user.id });
    const saved = await this.productRepo.save(product);

    await this.cache.del('products:list');

    await this.notificationsQueue.add(
      'product-created',
      { productId: saved.id, productName: saved.name, createdBy: user.email },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    this.logger.log(`Product created: ${saved.id}`);
    return saved;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<ProductEntity>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const cacheKey = `products:list:${page}:${limit}`;

    const cached = await this.cache.get<PaginatedResult<ProductEntity>>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache MISS for ${cacheKey}`);
    const [data, total] = await this.productRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { createdBy: true },
      select: { id: true, name: true, description: true, price: true, stock: true, createdAt: true, createdById: true },
    });

    const result: PaginatedResult<ProductEntity> = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findOne(id: string): Promise<ProductEntity> {
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cached = await this.cache.get<ProductEntity>(cacheKey);
    if (cached) return cached;

    const product = await this.productRepo.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    await this.cache.set(cacheKey, product, this.CACHE_TTL);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const updated = await this.productRepo.save(product);
    await this.cache.del(`${this.CACHE_PREFIX}${id}`);
    await this.cache.del('products:list');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    await this.cache.del(`${this.CACHE_PREFIX}${id}`);
    await this.cache.del('products:list');
    this.logger.log(`Product deleted: ${id}`);
  }
}
