import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { GetUser, RawHeaders, RoleProtected } from './decorators';
import { CreateUserDto, LoginDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    /* @Req() req: Express.Request */
    // @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],

    @Headers() headers: IncomingHttpHeaders,
  ) {
    /*const { user } = req; // es una instancia de User
    console.log(user); */

    return {
      ok: true,
      msg: 'Hello world from a private route',
      // user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  // es muy raro usar @SetMetadata directamente en el controller
  // @SetMetadata('roles', ['admin', 'super-user']) // agrega nueva info al controller
  @Get('private2')
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard) // custom guards no los instanciamos
  privateRoute2(@GetUser() user: User) {
    return { ok: true, user };
  }
}
