import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; service: string; timestamp: string }
  | { status: 'error'; message: string };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    fetch(`${apiBaseUrl}/api/health`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Backend returned HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setHealth({
            status: data.status === 'ok' ? 'ok' : 'error',
            service: data.service ?? 'unknown',
            timestamp: data.timestamp ?? new Date().toISOString(),
            message: data.status === 'ok' ? undefined : 'Unexpected health response',
          } as HealthState);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setHealth({ status: 'error', message: error.message });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Scale Admin MVP</p>
        <h1>Project foundation is running</h1>
        <p className="description">
          Docker Compose starts PostgreSQL, the NestJS backend, and this React frontend.
        </p>

        <div className={`status status-${health.status}`} data-testid="backend-health-status">
          <strong>Backend health:</strong>{' '}
          {health.status === 'loading' && 'checking...'}
          {health.status === 'ok' && `OK (${health.service})`}
          {health.status === 'error' && `Error: ${health.message}`}
        </div>

        {health.status === 'ok' && (
          <p className="timestamp">Last checked: {health.timestamp}</p>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
