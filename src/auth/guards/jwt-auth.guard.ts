import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canActivate(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    console.log(
      '[JwtAuthGuard] Authorization header:',
      authHeader ? 'present' : 'missing',
    );

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
