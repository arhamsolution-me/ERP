import { Reflector } from '@nestjs/core';
import { SalesController } from '../../modules/sales/sales.controller';
import { InventoryController } from '../../modules/inventory/inventory.controller';
import { FinanceController } from '../../modules/finance/finance.controller';
import { ProductionController } from '../../modules/production/production.controller';
import { HrController } from '../../modules/hr/hr.controller';
import { RolesController } from '../../modules/roles/roles.controller';
import { UsersController } from '../../modules/users/users.controller';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { RolesGuard } from './roles.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../../app.controller';

describe('Structural Guard & Permission Enforcement', () => {
  const reflector = new Reflector();

  const controllers = [
    { name: 'SalesController', target: SalesController },
    { name: 'InventoryController', target: InventoryController },
    { name: 'FinanceController', target: FinanceController },
    { name: 'ProductionController', target: ProductionController },
    { name: 'HrController', target: HrController },
    { name: 'RolesController', target: RolesController },
    { name: 'UsersController', target: UsersController },
  ];

  controllers.forEach(({ name, target }) => {
    describe(name, () => {
      it('should have ClerkAuthGuard and RolesGuard attached at class level', () => {
        const guards = Reflect.getMetadata('__guards__', target) || [];
        const guardNames = guards.map((g: any) => g.name || g.constructor.name);
        expect(guardNames).toContain('ClerkAuthGuard');
        expect(guardNames).toContain('RolesGuard');
      });

      it('should have explicit @Permissions() or @Public() on every handler', () => {
        const proto = target.prototype;
        const methods = Object.getOwnPropertyNames(proto).filter(
          m => m !== 'constructor' && typeof proto[m] === 'function'
        );

        for (const method of methods) {
          const handler = proto[method];
          const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, handler);
          const permissions = reflector.get<string[]>(PERMISSIONS_KEY, handler);

          if (!isPublic) {
            expect(permissions).toBeDefined();
            expect(permissions?.length).toBeGreaterThan(0);
          }
        }
      });
    });
  });
});
