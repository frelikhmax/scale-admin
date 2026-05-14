export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'operator';
  status: string;
};

export type AuthenticatedSession = {
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
};

export type AuthenticatedRequest = {
  headers?: Record<string, string | string[] | undefined>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  user?: AuthenticatedUser;
  session?: AuthenticatedSession;
};

export type UserRole = AuthenticatedUser['role'];
