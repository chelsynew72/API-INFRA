import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationDto } from '../../common/pipes/pagination.dto';
import { UserEntity } from '../../database/user.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto, user: UserEntity): Promise<import("../../database/product.entity").ProductEntity>;
    findAll(pagination: PaginationDto): Promise<import("../../common/pipes/pagination.dto").PaginatedResult<import("../../database/product.entity").ProductEntity>>;
    findOne(id: string): Promise<import("../../database/product.entity").ProductEntity>;
    update(id: string, dto: UpdateProductDto): Promise<import("../../database/product.entity").ProductEntity>;
    remove(id: string): Promise<void>;
}
