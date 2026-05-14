import { SetMetadata } from '@nestjs/common';

export const STORE_ACCESS_METADATA = 'auth:storeAccess';

export type StoreAccessSource = 'params' | 'query' | 'body';

export type StoreAccessRequirement = {
  source: StoreAccessSource;
  field: string;
};

export function RequireStoreAccess(field = 'storeId', source: StoreAccessSource = 'params') {
  return SetMetadata(STORE_ACCESS_METADATA, { field, source } satisfies StoreAccessRequirement);
}
