import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  private rolesGuard: RolesGuard;

  constructor(private reflector: Reflector) {
    super();
    this.rolesGuard = new RolesGuard(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const { user } = context.switchToHttp().getRequest();
    if (user?.role !== 'admin') {
      const { ForbiddenException } = await import('@nestjs/common');
      throw new ForbiddenException('어드민 권한이 필요합니다');
    }
    return true;
  }
}
