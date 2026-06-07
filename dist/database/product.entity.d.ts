import { UserEntity } from './user.entity';
export declare class ProductEntity {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    createdBy: UserEntity;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}
