import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCoach = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.coach[data];
    }
    return request.coach;
  },
);
