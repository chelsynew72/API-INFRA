export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class UserEntity {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
