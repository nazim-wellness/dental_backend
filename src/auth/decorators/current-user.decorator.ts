import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestWithUser = {
  user?: {
    userId: number;
    role: string;
  };
};

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.userId;
  },
);

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): { userId: number; role: string } | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user ?? null;
  },
);
