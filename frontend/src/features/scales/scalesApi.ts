import { backendApi } from '../../shared/api/backendApi';

export type ScaleDeviceStatus = 'active' | 'inactive' | 'blocked' | 'archived';

export type ScaleDevice = {
  id: string;
  storeId: string;
  deviceCode: string;
  name: string;
  model: string | null;
  status: ScaleDeviceStatus;
  lastSeenAt: string | null;
  lastSyncAt: string | null;
  currentCatalogVersionId: string | null;
  lastSyncStatus: 'no_update' | 'update_available' | 'package_delivered' | 'ack_received' | 'auth_failed' | 'error' | null;
  lastSyncError: {
    status: 'auth_failed' | 'error';
    message: string | null;
    requestedVersionId: string | null;
    deliveredVersionId: string | null;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ScaleDeviceFormValues = {
  deviceCode: string;
  name: string;
  model?: string;
  status?: ScaleDeviceStatus;
};

type CreateScaleDeviceRequest = ScaleDeviceFormValues & {
  storeId: string;
  csrfToken: string;
  csrfHeaderName: string;
};

type UpdateScaleDeviceStatusRequest = {
  deviceId: string;
  status: ScaleDeviceStatus;
  csrfToken: string;
  csrfHeaderName: string;
};

type RegenerateScaleDeviceTokenRequest = {
  deviceId: string;
  csrfToken: string;
  csrfHeaderName: string;
};

export type ScaleDeviceWithTokenResponse = {
  device: ScaleDevice;
  apiToken: string;
};

export const scalesApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    listScaleDevices: builder.query<{ devices: ScaleDevice[] }, string>({
      query: (storeId) => `/stores/${storeId}/scales`,
      providesTags: (result, _error, storeId) => [
        { type: 'ScaleDevices', id: `STORE-${storeId}` },
        ...(result?.devices.map((device) => ({ type: 'ScaleDevices' as const, id: device.id })) ?? []),
      ],
    }),
    createScaleDevice: builder.mutation<ScaleDeviceWithTokenResponse, CreateScaleDeviceRequest>({
      query: ({ storeId, csrfToken, csrfHeaderName, ...body }) => ({
        url: `/stores/${storeId}/scales`,
        method: 'POST',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
        body,
      }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: 'ScaleDevices', id: `STORE-${storeId}` }],
    }),
    updateScaleDeviceStatus: builder.mutation<{ device: ScaleDevice; changed: boolean }, UpdateScaleDeviceStatusRequest>({
      query: ({ deviceId, csrfToken, csrfHeaderName, status }) => ({
        url: `/scales/${deviceId}/status`,
        method: 'PATCH',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
        body: { status },
      }),
      invalidatesTags: (_result, _error, { deviceId }) => [{ type: 'ScaleDevices', id: deviceId }],
    }),
    regenerateScaleDeviceToken: builder.mutation<ScaleDeviceWithTokenResponse, RegenerateScaleDeviceTokenRequest>({
      query: ({ deviceId, csrfToken, csrfHeaderName }) => ({
        url: `/scales/${deviceId}/regenerate-token`,
        method: 'POST',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
      }),
      invalidatesTags: (_result, _error, { deviceId }) => [{ type: 'ScaleDevices', id: deviceId }],
    }),
  }),
});

export const {
  useListScaleDevicesQuery,
  useCreateScaleDeviceMutation,
  useUpdateScaleDeviceStatusMutation,
  useRegenerateScaleDeviceTokenMutation,
} = scalesApi;
