import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class AuthService {
  /**
   * JIT provisioning — called after successful Clerk token verification.
   * If the user doesn't exist in our DB, creates them.
   */
  async syncClerkUser(clerkUserId: string, tenantId: string, email: string) {
    let user = await prisma.user.findUnique({ where: { clerk_id: clerkUserId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          tenant_id: tenantId,
          clerk_id: clerkUserId,
          email,
          status: 'active',
        },
      });
    }

    return user;
  }
}
