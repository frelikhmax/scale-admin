import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { store } from './app/store';
import { useGetHealthQuery } from './features/health/healthApi';
import './styles.css';

function App() {
  const { data: health, error, isLoading, isFetching, refetch } = useGetHealthQuery();
  const isHealthy = health?.status === 'ok';
  const errorMessage = error && 'message' in error ? error.message : 'Unexpected health response';

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Scale Admin MVP</p>
        <h1>Project foundation is running</h1>
        <p className="description">
          Docker Compose starts PostgreSQL, the NestJS backend, and this React frontend.
        </p>

        <div
          className={`status status-${isLoading ? 'loading' : isHealthy ? 'ok' : 'error'}`}
          data-testid="backend-health-status"
        >
          <strong>Backend health:</strong>{' '}
          {isLoading && 'checking via RTK Query...'}
          {!isLoading && isHealthy && `OK (${health.service})`}
          {!isLoading && !isHealthy && `Error: ${errorMessage}`}
        </div>

        {isHealthy && <p className="timestamp">Last checked: {health.timestamp}</p>}

        {!isHealthy && !isLoading && (
          <p className="help-text">
            Health check is handled by the shared RTK Query backend API client.
          </p>
        )}

        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Checking...' : 'Check again'}
        </button>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
