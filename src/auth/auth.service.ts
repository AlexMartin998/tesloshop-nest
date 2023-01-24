import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// podemos crear el adapter
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // configurado x el JwtModule
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);

      return { ...user, token: this.getJwt({ id: user.id }) };
    } catch (error) {
      return this.handleDBErrors(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(
        'Hubo un problema al iniciar sesión. Comprueba tu correo electrónico y contraseña o crea una cuenta',
      );
    delete user.password;

    return { ...user, token: this.getJwt({ id: user.id }) };
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Something went wrong');
  }
}
