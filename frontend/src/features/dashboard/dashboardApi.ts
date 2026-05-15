import { backendApi } from '../../shared/api/backendApi';

export type DashboardProblemReason = 'latest_sync_error' | 'missing_sync' | 'outdated_catalog_version';

export type AdminDashboardLatestPublishedVersion = {
  id: string;
  catalogId: string;
  catalogName: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  versionNumber: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

export type AdminDashboardLatestSyncError = {
  id: string;
  scaleDeviceId: string;
  deviceCode: string;
  deviceName: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  status: 'auth_failed' | 'error';
  message: string | null;
  requestedVersionId: string | null;
  deliveredVersionId: string | null;
  createdAt: string;
};

export type AdminDashboardProblematicScaleDevice = {
  id: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  deviceCode: string;
  name: string;
  model: string | null;
  status: string;
  reasons: DashboardProblemReason[];
  lastSeenAt: string | null;
  lastSyncAt: string | null;
  currentCatalogVersionId: string | null;
  expectedCatalogVersionId: string | null;
  lastSyncStatus: string | null;
  lastSyncError: {
    id: string;
    status: 'auth_failed' | 'error';
    message: string | null;
    requestedVersionId: string | null;
    deliveredVersionId: string | null;
    createdAt: string;
  } | null;
  updatedAt: string;
};

export type AdminDashboardResponse = {
  counts: {
    stores: number;
    scaleDevices: number;
    scaleDevicesWithErrors: number;
    scaleDevicesWithoutSynchronization: number;
  };
  latestPublishedVersions: AdminDashboardLatestPublishedVersion[];
  latestSyncErrors: AdminDashboardLatestSyncError[];
  problematicScaleDevices: AdminDashboardProblematicScaleDevice[];
};

export const dashboardApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => '/admin/dashboard',
    }),
  }),
});

export const { useGetAdminDashboardQuery } = dashboardApi;
