import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable() // registrarlo como provider para poderlo inyectar
export class JwtStrategy extends PassportStrategy(Strategy) {
  // expandir la validacion del jwt: (PS valida el secret y si aun no ha expirado el jwt, strategy valida el token). Validar el status (borrado logico) hay q implementarlo

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<number>('jwtSecret'),

      //lo esperamos como un Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.isActive) throw new UnauthorizedException('Inactive user');

    return user; // lo agrega a la req: req.user
  }
}
