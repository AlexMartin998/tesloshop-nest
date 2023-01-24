import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],

  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // xq no es global en el root
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwtSecret'),
          signOptions: { expiresIn: '2d' },
        };
      },
    }),
    // JwtModule.register({
    //   secret: '121212',
    //   signOptions: { expiresIn: '2d' },
    // }),
  ],
})
export class AuthModule {}
