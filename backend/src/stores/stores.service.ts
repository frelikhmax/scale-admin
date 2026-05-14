import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listVisibleStores(user: AuthenticatedUser) {
    const stores = await this.prisma.store.findMany({
      where:
        user.role === 'admin'
          ? { status: { not: 'archived' } }
          : {
              status: { not: 'archived' },
              userAccesses: {
                some: {
                  userId: user.id,
                  revokedAt: null,
                },
              },
            },
      orderBy: [{ name: 'asc' }, { code: 'asc' }],
    });

    return {
      stores: stores.map((store) => ({
        id: store.id,
        code: store.code,
        name: store.name,
        address: store.address,
        timezone: store.timezone,
        status: store.status,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      })),
    };
  }
}
