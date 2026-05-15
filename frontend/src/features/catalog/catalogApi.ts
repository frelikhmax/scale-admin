import { backendApi } from '../../shared/api/backendApi';

export type CategoryStatus = 'active' | 'inactive' | 'archived';

export type CatalogSummary = {
  id: string;
  storeId: string;
  name: string;
  status: string;
};

export type CatalogCategory = {
  id: string;
  catalogId: string;
  parentId: string | null;
  name: string;
  shortName: string;
  sortOrder: number;
  status: CategoryStatus;
  canAcceptActivePlacements: boolean;
  createdAt: string;
  updatedAt: string;
  children: CatalogCategory[];
};

export type CategoryTreeResponse = {
  catalog: CatalogSummary;
  categories: CatalogCategory[];
};

export type CategoryWriteBody = {
  name?: string;
  shortName?: string;
  parentId?: string | null;
  sortOrder?: number;
  status?: CategoryStatus;
};

type CategoryWriteRequest = CategoryWriteBody & {
  storeId: string;
  csrfToken: string;
  csrfHeaderName: string;
};

type UpdateCategoryRequest = CategoryWriteRequest & {
  categoryId: string;
};

type ReorderCategoriesRequest = {
  storeId: string;
  parentId: string | null;
  categoryIds: string[];
  csrfToken: string;
  csrfHeaderName: string;
};

export const catalogApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    listCatalogCategories: builder.query<CategoryTreeResponse, string>({
      query: (storeId) => `/stores/${storeId}/catalog/categories`,
      providesTags: (_result, _error, storeId) => [{ type: 'CatalogCategories', id: storeId }],
    }),
    createCatalogCategory: builder.mutation<{ category: CatalogCategory }, CategoryWriteRequest>({
      query: ({ storeId, csrfToken, csrfHeaderName, ...body }) => ({
        url: `/stores/${storeId}/catalog/categories`,
        method: 'POST',
        headers: { [csrfHeaderName]: csrfToken },
        body,
      }),
      invalidatesTags: (_result, _error, { storeId }) => [
        { type: 'CatalogCategories', id: storeId },
        { type: 'Prices', id: storeId },
        { type: 'Publishing', id: storeId },
      ],
    }),
    updateCatalogCategory: builder.mutation<{ category: CatalogCategory }, UpdateCategoryRequest>({
      query: ({ storeId, categoryId, csrfToken, csrfHeaderName, ...body }) => ({
        url: `/stores/${storeId}/catalog/categories/${categoryId}`,
        method: 'PATCH',
        headers: { [csrfHeaderName]: csrfToken },
        body,
      }),
      invalidatesTags: (_result, _error, { storeId }) => [
        { type: 'CatalogCategories', id: storeId },
        { type: 'Prices', id: storeId },
        { type: 'Publishing', id: storeId },
      ],
    }),
    reorderCatalogCategories: builder.mutation<{ categories: CatalogCategory[] }, ReorderCategoriesRequest>({
      query: ({ storeId, csrfToken, csrfHeaderName, parentId, categoryIds }) => ({
        url: `/stores/${storeId}/catalog/categories/reorder`,
        method: 'POST',
        headers: { [csrfHeaderName]: csrfToken },
        body: { parentId, categoryIds },
      }),
      invalidatesTags: (_result, _error, { storeId }) => [
        { type: 'CatalogCategories', id: storeId },
        { type: 'Prices', id: storeId },
        { type: 'Publishing', id: storeId },
      ],
    }),
  }),
});

export const {
  useListCatalogCategoriesQuery,
  useCreateCatalogCategoryMutation,
  useUpdateCatalogCategoryMutation,
  useReorderCatalogCategoriesMutation,
} = catalogApi;
