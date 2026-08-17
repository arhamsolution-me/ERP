import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { SecurityExceptionFilter } from './common/filters/security-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HealthModule } from './modules/health/health.module';
import { ProductionModule } from './modules/production/production.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProductionModule,
    InventoryModule,
    SalesModule,
    FinanceModule,
    HrModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global ThrottlerGuard for rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global RolesGuard — checks explicit permissions & tenant match per route
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global AuditInterceptor — automatically logs mutating operations
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // Global SecurityExceptionFilter — masks internal error leakage
    {
      provide: APP_FILTER,
      useClass: SecurityExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TenantResolverMiddleware globally to all routes
    consumer.apply(TenantResolverMiddleware).forRoutes('*');
  }
}
