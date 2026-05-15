import { backendApi } from '../../shared/api/backendApi';

export type CatalogValidationIssue = {
  code: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export type CatalogValidationResponse = {
  catalog: {
    id: string;
    storeId: string;
    name: string;
    status: string;
    currentVersionId: string | null;
  };
  canPublish: boolean;
  blockingErrors: CatalogValidationIssue[];
  warnings: CatalogValidationIssue[];
  summary: {
    categoryCount: number;
    activePlacementCount: number;
    activeBannerCount: number;
    catalogVersionCount: number;
  };
};

export type CatalogVersionHistoryItem = {
  id: string;
  versionNumber: number;
  status: string;
  publishedAt: string | null;
  publishedBy: string | null;
  publishedByUserId: string | null;
  checksum: string;
  packageChecksum: string;
};

export type PublishCatalogResponse = {
  catalog: {
    id: string;
    storeId: string;
    previousVersionId: string | null;
    currentVersionId: string;
  };
  version: {
    id: string;
    catalogId: string;
    storeId: string;
    versionNumber: number;
    status: string;
    publishedByUserId: string | null;
    publishedAt: string | null;
    basedOnVersionId: string | null;
    packageChecksum: string;
  };
  validation: CatalogValidationResponse;
};

type PublishingWriteRequest = {
  storeId: string;
  csrfToken: string;
  csrfHeaderName: string;
};

export const publishingApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getCatalogVersions: builder.query<{ currentVersion: CatalogVersionHistoryItem | null; versions: CatalogVersionHistoryItem[] }, string>({
      query: (storeId) => `/stores/${storeId}/publishing/catalog-versions`,
      providesTags: (_result, _error, storeId) => [{ type: 'Publishing', id: storeId }],
    }),
    validateCatalog: builder.mutation<CatalogValidationResponse, PublishingWriteRequest>({
      query: ({ storeId, csrfToken, csrfHeaderName }) => ({
        url: `/stores/${storeId}/publishing/catalog-validation`,
        method: 'POST',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
      }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: 'Publishing', id: storeId }],
    }),
    publishCatalog: builder.mutation<PublishCatalogResponse, PublishingWriteRequest>({
      query: ({ storeId, csrfToken, csrfHeaderName }) => ({
        url: `/stores/${storeId}/publishing/catalog-publish`,
        method: 'POST',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
      }),
      invalidatesTags: (_result, _error, { storeId }) => [
        { type: 'Publishing', id: storeId },
        { type: 'Prices', id: storeId },
      ],
    }),
  }),
});

export const {
  useGetCatalogVersionsQuery,
  useValidateCatalogMutation,
  usePublishCatalogMutation,
} = publishingApi;
