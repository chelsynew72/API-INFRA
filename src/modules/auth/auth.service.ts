import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { UserEntity } from '../../database/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  private hashPassword(password: string, salt: string): string {
    return createHash('sha256').update(`${password}:${salt}`).digest('hex');
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const salt = randomBytes(16).toString('hex');
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

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email, isActive: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const [salt, storedHash] = user.password.split(':');
    const inputHash = this.hashPassword(dto.password, salt);

    const storedBuf = Buffer.from(storedHash, 'hex');
    const inputBuf = Buffer.from(inputHash, 'hex');
    if (!timingSafeEqual(storedBuf, inputBuf)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
