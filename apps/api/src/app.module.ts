import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';
import { RolesGuard } from './common/guards/roles.guard';
import { ProductionModule } from './modules/production/production.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';

@Module({
  imports: [AuthModule, UsersModule, RolesModule, ProductionModule, InventoryModule, SalesModule, FinanceModule, HrModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Register RolesGuard globally — it reads permissions metadata per route.
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TenantResolverMiddleware globally to all routes
    consumer.apply(TenantResolverMiddleware).forRoutes('*');
  }
}
