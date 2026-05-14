import { backendApi } from '../../shared/api/backendApi';

export type UserRole = 'admin' | 'operator';
export type UserStatus = 'active' | 'blocked' | string;

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
};

export type SessionInfo = {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
};

export type SessionResponse = {
  session: SessionInfo;
  user: AuthUser;
};

export type LoginResponse = {
  user: AuthUser;
  expiresAt: string;
};

export type CsrfResponse = {
  csrfToken: string;
  headerName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  csrfToken: string;
  csrfHeaderName: string;
};

export type LogoutRequest = {
  csrfToken: string;
  csrfHeaderName: string;
};

export const authApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getCsrfToken: builder.query<CsrfResponse, void>({
      query: () => '/auth/csrf',
    }),
    getSession: builder.query<SessionResponse, void>({
      query: () => '/auth/session',
      providesTags: ['Session'],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: ({ email, password, csrfToken, csrfHeaderName }) => ({
        url: '/auth/login',
        method: 'POST',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
        body: { email, password },
      }),
      invalidatesTags: ['Session'],
    }),
    logout: builder.mutation<{ revoked: boolean }, LogoutRequest>({
      query: ({ csrfToken, csrfHeaderName }) => ({
        url: '/auth/logout',
        method: 'POST',
        headers: {
          [csrfHeaderName]: csrfToken,
        },
      }),
      invalidatesTags: ['Session'],
    }),
  }),
});

export const {
  useGetCsrfTokenQuery,
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
