import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// esto deberia estar en common/ xq no es especifico del auth
export const RawHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const { rawHeaders } = req;

    return rawHeaders;
  },
);
