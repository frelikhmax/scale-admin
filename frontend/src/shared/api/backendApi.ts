import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

type BackendErrorData = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export type ApiError = {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR';
  message: string;
};

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${backendBaseUrl}/api`,
  credentials: 'include',
});

function messageFromData(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const errorData = data as BackendErrorData;
  const message = Array.isArray(errorData.message)
    ? errorData.message.join(', ')
    : errorData.message;

  return message ?? errorData.error;
}

function normalizeError(error: FetchBaseQueryError): ApiError {
  if (error.status === 401) {
    return {
      status: 401,
      message: 'Требуется авторизация. Войдите в систему и повторите запрос.',
    };
  }

  if (error.status === 403) {
    return {
      status: 403,
      message: 'Недостаточно прав для выполнения запроса.',
    };
  }

  if (error.status === 'FETCH_ERROR') {
    return {
      status: 'FETCH_ERROR',
      message: 'Backend недоступен. Проверьте, что сервер запущен, и повторите попытку.',
    };
  }

  if (error.status === 'PARSING_ERROR') {
    return {
      status: 'PARSING_ERROR',
      message: 'Backend вернул неожиданный формат ответа.',
    };
  }

  if (error.status === 'TIMEOUT_ERROR') {
    return {
      status: 'TIMEOUT_ERROR',
      message: 'Backend не ответил вовремя. Повторите попытку позже.',
    };
  }

  if (error.status === 'CUSTOM_ERROR') {
    return {
      status: 'CUSTOM_ERROR',
      message: error.error,
    };
  }

  return {
    status: error.status,
    message: messageFromData(error.data) ?? `Backend returned HTTP ${error.status}`,
  };
}

const backendBaseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    return { error: normalizeError(result.error) };
  }

  return { data: result.data };
};

export const backendApi = createApi({
  reducerPath: 'backendApi',
  baseQuery: backendBaseQuery,
  endpoints: () => ({}),
});
