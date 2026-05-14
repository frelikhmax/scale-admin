import { type FormEvent, StrictMode, useState } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { store } from './app/store';
import {
  useGetCsrfTokenQuery,
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  type AuthUser,
} from './features/auth/authApi';
import { useGetHealthQuery } from './features/health/healthApi';
import './styles.css';

function HealthStatus() {
  const { data: health, error, isLoading, isFetching, refetch } = useGetHealthQuery();
  const isHealthy = health?.status === 'ok';
  const errorMessage = error && 'message' in error ? error.message : 'Unexpected health response';

  return (
    <section className="panel" aria-labelledby="system-status-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">System status</p>
          <h2 id="system-status-title">Backend health</h2>
        </div>
        <button className="secondary-button" type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Checking...' : 'Check again'}
        </button>
      </div>

      <div
        className={`status status-${isLoading ? 'loading' : isHealthy ? 'ok' : 'error'}`}
        data-testid="backend-health-status"
      >
        <strong>Health endpoint:</strong>{' '}
        {isLoading && 'checking via RTK Query...'}
        {!isLoading && isHealthy && `OK (${health.service})`}
        {!isLoading && !isHealthy && `Error: ${errorMessage}`}
      </div>

      {isHealthy && <p className="timestamp">Last checked: {health.timestamp}</p>}
      {!isHealthy && !isLoading && (
        <p className="help-text">Health check is handled by the shared RTK Query backend API client.</p>
      )}
    </section>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { data: csrf, isLoading: csrfLoading, error: csrfError, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [login, { isLoading: loginLoading }] = useLoginMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError('Введите email и пароль.');
      return;
    }

    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      setFormError('Не удалось подготовить защищённую форму входа. Повторите попытку.');
      return;
    }

    try {
      await login({
        email: trimmedEmail,
        password,
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setPassword('');
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Не удалось войти. Проверьте email и пароль.';
      setFormError(message);
    }
  }

  const csrfErrorMessage = csrfError && 'message' in csrfError ? csrfError.message : null;

  return (
    <main className="auth-shell">
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">Scale Admin</p>
        <h1 id="login-title">Вход в систему</h1>
        <p className="description">Войдите, чтобы открыть защищённую панель администрирования.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              type="password"
              value={password}
            />
          </label>

          {(formError || csrfErrorMessage) && (
            <div className="form-error" role="alert">
              {formError ?? csrfErrorMessage}
            </div>
          )}

          <button type="submit" disabled={csrfLoading || loginLoading}>
            {loginLoading ? 'Входим...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ user }: { user: AuthUser }) {
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [logout, { isLoading: logoutLoading, error: logoutError }] = useLogoutMutation();

  async function handleLogout() {
    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      return;
    }

    await logout({ csrfToken: csrfData.csrfToken, csrfHeaderName: csrfData.headerName }).unwrap().catch(() => undefined);
  }

  const displayName = user.fullName || user.email;
  const logoutErrorMessage = logoutError && 'message' in logoutError ? logoutError.message : null;

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Добро пожаловать, {displayName}</h1>
          <p className="description">
            Active session for {user.email} · role: <strong>{user.role}</strong>
          </p>
        </div>
        <button type="button" onClick={handleLogout} disabled={logoutLoading}>
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </section>

      {logoutErrorMessage && <div className="form-error" role="alert">{logoutErrorMessage}</div>}

      <HealthStatus />
    </main>
  );
}

function App() {
  const { data: session, isLoading, isFetching, error } = useGetSessionQuery();
  const hasActiveSession = Boolean(session?.user);

  if (isLoading || (isFetching && !session && !error)) {
    return (
      <main className="app-shell">
        <section className="card">
          <p className="eyebrow">Scale Admin</p>
          <h1>Checking session...</h1>
          <div className="status status-loading">Loading protected session state via RTK Query.</div>
        </section>
      </main>
    );
  }

  if (!hasActiveSession) {
    return <LoginScreen />;
  }

  return <Dashboard user={session!.user} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
