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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const user_entity_1 = require("../../database/user.entity");
let AuthService = class AuthService {
    userRepo;
    jwtService;
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    hashPassword(password, salt) {
        return (0, crypto_1.createHash)('sha256').update(`${password}:${salt}`).digest('hex');
    }
    async register(dto) {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hashed = this.hashPassword(dto.password, salt);
        const user = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            password: `${salt}:${hashed}`,
        });
        await this.userRepo.save(user);
        const { password: _, ...result } = user;
        return result;
    }
    async login(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email, isActive: true } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const [salt, storedHash] = user.password.split(':');
        const inputHash = this.hashPassword(dto.password, salt);
        const storedBuf = Buffer.from(storedHash, 'hex');
        const inputBuf = Buffer.from(inputHash, 'hex');
        if (!(0, crypto_1.timingSafeEqual)(storedBuf, inputBuf)) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        return { accessToken: this.jwtService.sign(payload) };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map