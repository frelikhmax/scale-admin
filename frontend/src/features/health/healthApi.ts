import { backendApi } from '../../shared/api/backendApi';

export type HealthResponse = {
  status: 'ok' | string;
  service: string;
  timestamp: string;
};

export const healthApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => '/health',
    }),
  }),
});

export const { useGetHealthQuery } = healthApi;
