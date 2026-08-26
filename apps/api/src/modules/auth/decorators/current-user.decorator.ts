import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  userId: string;
  email: string;
  gymId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  }
);
