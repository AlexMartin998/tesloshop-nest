import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

// data y ctx los pasa nest cuando es llamado este decorator - args
// context (ctx) contiene la req
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new InternalServerErrorException('User not found');

    // return data === 'email' ? user.email : user;
    return !data ? user : user[data];
  },
);
