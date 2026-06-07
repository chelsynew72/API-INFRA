"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const bull_1 = require("@nestjs/bull");
const product_entity_1 = require("../../database/product.entity");
let ProductsService = ProductsService_1 = class ProductsService {
    productRepo;
    cache;
    notificationsQueue;
    logger = new common_1.Logger(ProductsService_1.name);
    CACHE_TTL = 60;
    CACHE_PREFIX = 'product:';
    constructor(productRepo, cache, notificationsQueue) {
        this.productRepo = productRepo;
        this.cache = cache;
        this.notificationsQueue = notificationsQueue;
    }
    async create(dto, user) {
        const product = this.productRepo.create({ ...dto, createdById: user.id });
        const saved = await this.productRepo.save(product);
        await this.cache.del('products:list');
        await this.notificationsQueue.add('product-created', { productId: saved.id, productName: saved.name, createdBy: user.email }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
        this.logger.log(`Product created: ${saved.id}`);
        return saved;
    }
    async findAll(pagination) {
        const page = pagination.page ?? 1;
        const limit = pagination.limit ?? 10;
        const cacheKey = `products:list:${page}:${limit}`;
        const cached = await this.cache.get(cacheKey);
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
        const result = {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
        await this.cache.set(cacheKey, result, this.CACHE_TTL);
        return result;
    }
    async findOne(id) {
        const cacheKey = `${this.CACHE_PREFIX}${id}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const product = await this.productRepo.findOne({
            where: { id },
            relations: { createdBy: true },
        });
        if (!product)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        await this.cache.set(cacheKey, product, this.CACHE_TTL);
        return product;
    }
    async update(id, dto) {
        const product = await this.findOne(id);
        Object.assign(product, dto);
        const updated = await this.productRepo.save(product);
        await this.cache.del(`${this.CACHE_PREFIX}${id}`);
        await this.cache.del('products:list');
        return updated;
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productRepo.remove(product);
        await this.cache.del(`${this.CACHE_PREFIX}${id}`);
        await this.cache.del('products:list');
        this.logger.log(`Product deleted: ${id}`);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(2, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map