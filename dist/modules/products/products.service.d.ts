import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import type { Queue } from 'bull';
import { ProductEntity } from '../../database/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto, PaginatedResult } from '../../common/pipes/pagination.dto';
import { UserEntity } from '../../database/user.entity';
export declare class ProductsService {
    private readonly productRepo;
    private readonly cache;
    private readonly notificationsQueue;
    private readonly logger;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    constructor(productRepo: Repository<ProductEntity>, cache: Cache, notificationsQueue: Queue);
    create(dto: CreateProductDto, user: UserEntity): Promise<ProductEntity>;
    findAll(pagination: PaginationDto): Promise<PaginatedResult<ProductEntity>>;
    findOne(id: string): Promise<ProductEntity>;
    update(id: string, dto: UpdateProductDto): Promise<ProductEntity>;
    remove(id: string): Promise<void>;
}
