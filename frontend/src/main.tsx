import { type FormEvent, StrictMode, useEffect, useMemo, useState } from 'react';
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
import {
  useListStorePricesQuery,
  useUpdateStoreProductPriceMutation,
  type PriceRow,
} from './features/prices/pricesApi';
import {
  useGetCatalogVersionsQuery,
  usePublishCatalogMutation,
  useValidateCatalogMutation,
  type CatalogValidationIssue,
  type CatalogValidationResponse,
  type CatalogVersionHistoryItem,
  type PublishCatalogResponse,
} from './features/publishing/publishingApi';
import {
  useCreateScaleDeviceMutation,
  useListScaleDevicesQuery,
  useRegenerateScaleDeviceTokenMutation,
  useUpdateScaleDeviceStatusMutation,
  type ScaleDevice,
  type ScaleDeviceStatus,
} from './features/scales/scalesApi';
import {
  useCreateStoreMutation,
  useGetStoreQuery,
  useListStoresQuery,
  useUpdateStoreMutation,
  type Store,
  type StoreFormValues,
  type StoreStatus,
} from './features/stores/storesApi';
import {
  useBlockUserMutation,
  useChangeUserRoleMutation,
  useCreateInviteMutation,
  useGrantStoreAccessMutation,
  useListUserStoreAccessesQuery,
  useListUsersQuery,
  useRevokeStoreAccessMutation,
  useUnblockUserMutation,
  type ManagedUser,
} from './features/users/usersApi';
import './styles.css';

type DashboardView =
  | { name: 'overview' }
  | { name: 'stores' }
  | { name: 'store-details'; storeId: string }
  | { name: 'store-create' }
  | { name: 'store-edit'; storeId: string }
  | { name: 'users-access' };

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

function Navigation({ user, activeView, onNavigate }: { user: AuthUser; activeView: DashboardView; onNavigate: (view: DashboardView) => void }) {
  const storesActive = activeView.name.startsWith('store');

  return (
    <nav className="app-nav" aria-label="Primary navigation">
      <button
        className={activeView.name === 'overview' ? 'nav-button nav-button-active' : 'nav-button'}
        type="button"
        onClick={() => onNavigate({ name: 'overview' })}
      >
        Overview
      </button>
      <button
        className={storesActive ? 'nav-button nav-button-active' : 'nav-button'}
        type="button"
        onClick={() => onNavigate({ name: 'stores' })}
      >
        Stores
      </button>
      {user.role === 'admin' ? (
        <>
          <button className="nav-button" type="button" onClick={() => onNavigate({ name: 'store-create' })}>
            Create store
          </button>
          <button
            className={activeView.name === 'users-access' ? 'nav-button nav-button-active' : 'nav-button'}
            type="button"
            onClick={() => onNavigate({ name: 'users-access' })}
          >
            Users & Access
          </button>
        </>
      ) : (
        <span className="nav-note">Operator navigation: assigned stores only</span>
      )}
    </nav>
  );
}

function StoresList({ user, onNavigate }: { user: AuthUser; onNavigate: (view: DashboardView) => void }) {
  const { data, error, isLoading, isFetching, refetch } = useListStoresQuery();
  const stores = data?.stores ?? [];
  const errorMessage = error && 'message' in error ? error.message : null;

  return (
    <section className="panel" aria-labelledby="stores-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{user.role === 'admin' ? 'Admin stores' : 'Assigned stores'}</p>
          <h2 id="stores-title">Stores</h2>
          <p className="muted">
            {user.role === 'admin'
              ? 'Admins can see every non-archived store and manage store records.'
              : 'Operators see only stores assigned to their account.'}
          </p>
        </div>
        <div className="action-row">
          <button className="secondary-button" type="button" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          {user.role === 'admin' && (
            <button type="button" onClick={() => onNavigate({ name: 'store-create' })}>
              Create store
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="status status-loading">Loading stores via RTK Query...</div>}
      {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}
      {!isLoading && !errorMessage && stores.length === 0 && <div className="empty-state">No stores available.</div>}

      {stores.length > 0 && (
        <div className="store-list" data-testid="stores-list">
          {stores.map((store) => (
            <article className="store-card" key={store.id}>
              <div>
                <p className="store-code">{store.code}</p>
                <h3>{store.name}</h3>
                <p className="muted">{store.address || 'No address'} · {store.timezone}</p>
              </div>
              <div className="store-actions">
                <span className={`badge badge-${store.status}`}>{store.status}</span>
                <button className="secondary-button" type="button" onClick={() => onNavigate({ name: 'store-details', storeId: store.id })}>
                  Details
                </button>
                {user.role === 'admin' && (
                  <button className="secondary-button" type="button" onClick={() => onNavigate({ name: 'store-edit', storeId: store.id })}>
                    Edit
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StoreDetails({ user, storeId, onNavigate }: { user: AuthUser; storeId: string; onNavigate: (view: DashboardView) => void }) {
  const { data, error, isLoading } = useGetStoreQuery(storeId);
  const { data: versionsData, error: versionsError, isLoading: versionsLoading } = useGetCatalogVersionsQuery(storeId);
  const store = data?.store;
  const currentVersion = versionsData?.currentVersion ?? null;
  const errorMessage = error && 'message' in error ? error.message : null;
  const versionsErrorMessage = versionsError && 'message' in versionsError ? versionsError.message : null;

  return (
    <section className="panel" aria-labelledby="store-details-title">
      <button className="link-button" type="button" onClick={() => onNavigate({ name: 'stores' })}>
        ← Back to stores
      </button>
      {isLoading && <div className="status status-loading">Loading store details...</div>}
      {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}
      {versionsErrorMessage && <div className="form-error" role="alert">{versionsErrorMessage}</div>}
      {store && (
        <>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Store details</p>
              <h2 id="store-details-title">{store.name}</h2>
              <p className="muted">{store.code}</p>
            </div>
            <div className="action-row">
              <span className={`badge badge-${store.status}`}>{store.status}</span>
              {user.role === 'admin' && (
                <button type="button" onClick={() => onNavigate({ name: 'store-edit', storeId: store.id })}>
                  Edit store
                </button>
              )}
            </div>
          </div>
          <dl className="details-grid">
            <div><dt>Address</dt><dd>{store.address || '—'}</dd></div>
            <div><dt>Timezone</dt><dd>{store.timezone}</dd></div>
            <div><dt>Published catalog</dt><dd>{versionsLoading ? 'Loading…' : formatVersionLabel(currentVersion)}</dd></div>
            <div><dt>Created</dt><dd>{new Date(store.createdAt).toLocaleString()}</dd></div>
            <div><dt>Updated</dt><dd>{new Date(store.updatedAt).toLocaleString()}</dd></div>
          </dl>
          <ScaleDevicesTab storeId={store.id} userRole={user.role} currentVersionId={currentVersion?.id ?? null} />
          <PricesTab storeId={store.id} />
          <PublishingTab storeId={store.id} userRole={user.role} currentVersion={currentVersion} />
        </>
      )}
    </section>
  );
}

function ScaleDevicesTab({ storeId, userRole, currentVersionId }: { storeId: string; userRole: AuthUser['role']; currentVersionId: string | null }) {
  const isAdmin = userRole === 'admin';
  const { data, error, isLoading, isFetching, refetch } = useListScaleDevicesQuery(storeId);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [createDevice, { isLoading: creating }] = useCreateScaleDeviceMutation();
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateScaleDeviceStatusMutation();
  const [regenerateToken, { isLoading: regenerating }] = useRegenerateScaleDeviceTokenMutation();
  const [deviceCode, setDeviceCode] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [issuedToken, setIssuedToken] = useState<{ deviceId: string; deviceCode: string; apiToken: string; action: 'created' | 'regenerated' } | null>(null);
  const devices = data?.devices ?? [];
  const errorMessage = error && 'message' in error ? error.message : null;

  async function getCsrfOrThrow() {
    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      throw new Error('Не удалось подготовить защищённую форму. Повторите попытку.');
    }
    return csrfData;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setActionError(null);
    setIssuedToken(null);

    const trimmedCode = deviceCode.trim();
    const trimmedName = name.trim();
    const trimmedModel = model.trim();
    if (!trimmedCode || !trimmedName) {
      setFormError('Device code and name are required.');
      return;
    }

    try {
      const csrfData = await getCsrfOrThrow();
      const response = await createDevice({
        storeId,
        deviceCode: trimmedCode,
        name: trimmedName,
        model: trimmedModel || undefined,
        status: 'active',
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setIssuedToken({
        deviceId: response.device.id,
        deviceCode: response.device.deviceCode,
        apiToken: response.apiToken,
        action: 'created',
      });
      setDeviceCode('');
      setName('');
      setModel('');
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Scale device could not be registered.';
      setFormError(message);
    }
  }

  async function handleBlock(device: ScaleDevice) {
    setActionError(null);
    setIssuedToken(null);

    try {
      const csrfData = await getCsrfOrThrow();
      await updateStatus({
        deviceId: device.id,
        status: 'blocked',
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Scale device could not be blocked.';
      setActionError(message);
    }
  }

  async function handleRegenerate(device: ScaleDevice) {
    setActionError(null);
    setIssuedToken(null);

    try {
      const csrfData = await getCsrfOrThrow();
      const response = await regenerateToken({
        deviceId: device.id,
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setIssuedToken({
        deviceId: response.device.id,
        deviceCode: response.device.deviceCode,
        apiToken: response.apiToken,
        action: 'regenerated',
      });
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Scale device token could not be regenerated.';
      setActionError(message);
    }
  }

  return (
    <section className="scale-devices-tab" aria-labelledby="scale-devices-title">
      <div className="panel-heading scale-devices-heading">
        <div>
          <p className="eyebrow">Scale Devices</p>
          <h3 id="scale-devices-title">Store scale devices</h3>
          <p className="muted">{isAdmin ? 'Register devices, block access and rotate API tokens.' : 'Publication and sync status for this store.'}</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing...' : 'Refresh devices'}
        </button>
      </div>

      {isAdmin && (
        <form className="scale-device-form" onSubmit={handleCreate}>
          <label>
            Device code
            <input value={deviceCode} onChange={(event) => setDeviceCode(event.target.value)} placeholder="SCALE-001" />
          </label>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Front counter scale" />
          </label>
          <label>
            Model
            <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Optional model" />
          </label>
          <button type="submit" disabled={creating}>{creating ? 'Registering...' : 'Register device'}</button>
        </form>
      )}

      {formError && <div className="form-error" role="alert">{formError}</div>}
      {actionError && <div className="form-error" role="alert">{actionError}</div>}
      {issuedToken && (
        <div className="token-notice" role="status">
          <strong>API token {issuedToken.action === 'created' ? 'created' : 'regenerated'} for {issuedToken.deviceCode}.</strong>
          <span>Copy it now. This plain token is shown only once and is not stored in the UI.</span>
          <code>{issuedToken.apiToken}</code>
          <button className="secondary-button" type="button" onClick={() => setIssuedToken(null)}>Hide token</button>
        </div>
      )}

      {isLoading && <div className="status status-loading">Loading scale devices...</div>}
      {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}
      {!isLoading && !errorMessage && devices.length === 0 && <div className="empty-state">No scale devices registered for this store.</div>}
      {devices.length > 0 && (
        <div className="scale-device-table-wrap">
          <table className="scale-device-table">
            <thead>
              <tr>
                <th>Device code</th>
                {isAdmin && <th>Name</th>}
                {isAdmin && <th>Model</th>}
                <th>Status</th>
                <th>Last seen</th>
                <th>Last sync</th>
                <th>Catalog version</th>
                <th>Sync status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const isOutdated = Boolean(currentVersionId && device.currentCatalogVersionId !== currentVersionId);

                return (
                  <tr className={isOutdated ? 'scale-device-outdated' : undefined} key={device.id}>
                    <td><code>{device.deviceCode}</code>{!isAdmin && <span className="operator-device-name">{device.name}</span>}</td>
                    {isAdmin && <td>{device.name}</td>}
                    {isAdmin && <td>{device.model ?? '—'}</td>}
                    <td><ScaleDeviceStatusBadge status={device.status} /></td>
                    <td>{formatDateTime(device.lastSeenAt)}</td>
                    <td>{formatDateTime(device.lastSyncAt)}</td>
                    <td>
                      <code>{device.currentCatalogVersionId ?? '—'}</code>
                      {isOutdated && <span className="sync-note">Not updated to current version</span>}
                    </td>
                    <td><ScaleSyncStatusCell device={device} /></td>
                    {isAdmin && (
                      <td>
                        <div className="table-actions">
                          <button className="secondary-button" type="button" onClick={() => handleBlock(device)} disabled={updatingStatus || device.status === 'blocked'}>
                            {device.status === 'blocked' ? 'Blocked' : 'Block'}
                          </button>
                          <button className="secondary-button" type="button" onClick={() => handleRegenerate(device)} disabled={regenerating}>
                            Regenerate token
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ScaleDeviceStatusBadge({ status }: { status: ScaleDeviceStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

function ScaleSyncStatusCell({ device }: { device: ScaleDevice }) {
  if (device.lastSyncError) {
    return (
      <div className="sync-status sync-status-error">
        <span className="badge badge-sync-error">{device.lastSyncError.status}</span>
        <small>{device.lastSyncError.message || 'Scale reported a synchronization error.'}</small>
        <small>{formatDateTime(device.lastSyncError.createdAt)}</small>
      </div>
    );
  }

  return (
    <div className="sync-status">
      <span className={`badge badge-sync-${device.lastSyncStatus ?? 'unknown'}`}>{device.lastSyncStatus ?? 'no sync yet'}</span>
    </div>
  );
}

function formatVersionLabel(version: CatalogVersionHistoryItem | null | undefined) {
  if (!version) {
    return 'No published version';
  }

  return `v${version.versionNumber} (${version.id})`;
}

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : '—';
}

function shortChecksum(value: string | null | undefined) {
  return value ? `${value.slice(0, 12)}…` : '—';
}

function PublishingTab({ storeId, userRole, currentVersion }: { storeId: string; userRole: AuthUser['role']; currentVersion: CatalogVersionHistoryItem | null }) {
  const { data: versionsData, error: versionsError, isLoading: versionsLoading, isFetching: versionsFetching, refetch } = useGetCatalogVersionsQuery(storeId);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [validateCatalog, { isLoading: validating }] = useValidateCatalogMutation();
  const [publishCatalog, { isLoading: publishing }] = usePublishCatalogMutation();
  const [validation, setValidation] = useState<CatalogValidationResponse | null>(null);
  const [lastPublished, setLastPublished] = useState<PublishCatalogResponse['version'] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isAdmin = userRole === 'admin';
  const versions = versionsData?.versions ?? [];
  const displayedCurrentVersion = versionsData?.currentVersion ?? currentVersion;
  const versionsErrorMessage = versionsError && 'message' in versionsError ? versionsError.message : null;
  const hasBlockingErrors = Boolean(validation && validation.blockingErrors.length > 0);
  const canPublish = Boolean(validation?.canPublish) && !hasBlockingErrors;

  async function getCsrfOrThrow() {
    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      throw new Error('Не удалось подготовить защищённую форму. Повторите попытку.');
    }
    return csrfData;
  }

  async function handleValidate() {
    setActionError(null);
    setLastPublished(null);

    try {
      const csrfData = await getCsrfOrThrow();
      const response = await validateCatalog({
        storeId,
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setValidation(response);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Catalog validation could not be completed.';
      setActionError(message);
    }
  }

  async function handlePublish() {
    setActionError(null);

    if (!canPublish) {
      setActionError('Run validation and resolve blocking errors before publishing.');
      return;
    }

    try {
      const csrfData = await getCsrfOrThrow();
      const response = await publishCatalog({
        storeId,
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setValidation(response.validation);
      setLastPublished(response.version);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Catalog could not be published.';
      setActionError(message);
    }
  }

  return (
    <section className="publishing-tab" aria-labelledby="publishing-title">
      <div className="panel-heading publishing-heading">
        <div>
          <p className="eyebrow">Versions / Publishing</p>
          <h3 id="publishing-title">Validate and publish catalog versions</h3>
          <p className="muted">After a catalog is published, later changes require a new validation and a new version.</p>
        </div>
        {isAdmin && (
          <div className="action-row">
            <button className="secondary-button" type="button" onClick={handleValidate} disabled={validating || publishing}>
              {validating ? 'Validating...' : 'Run validation'}
            </button>
            <button type="button" onClick={handlePublish} disabled={publishing || validating || !canPublish}>
              {publishing ? 'Publishing...' : 'Publish catalog'}
            </button>
          </div>
        )}
      </div>

      <div className="publication-status-card">
        <strong>Current published catalog</strong>
        <span>{formatVersionLabel(displayedCurrentVersion)}</span>
        {displayedCurrentVersion?.publishedAt && <small>Published at {formatDateTime(displayedCurrentVersion.publishedAt)}</small>}
      </div>

      {actionError && <div className="form-error" role="alert">{actionError}</div>}
      {lastPublished && (
        <div className="status status-ok" role="status">
          Published version <strong>v{lastPublished.versionNumber}</strong> at {formatDateTime(lastPublished.publishedAt)}.
        </div>
      )}

      {isAdmin && validation ? (
        <div className="validation-grid">
          <div className={`validation-summary ${validation.canPublish ? 'validation-summary-ok' : 'validation-summary-blocked'}`}>
            <strong>{validation.canPublish ? 'Ready to publish' : 'Publication blocked'}</strong>
            <span>{validation.blockingErrors.length} blocking errors · {validation.warnings.length} warnings</span>
            <span>{validation.summary.categoryCount} categories · {validation.summary.activePlacementCount} active products · {validation.summary.activeBannerCount} active banners</span>
          </div>
          <IssueList title="Blocking errors" issues={validation.blockingErrors} emptyText="No blocking errors found." tone="error" />
          <IssueList title="Warnings" issues={validation.warnings} emptyText="No warnings found." tone="warning" />
        </div>
      ) : isAdmin ? (
        <div className="empty-state">Run validation to see blocking errors, warnings and publishing readiness.</div>
      ) : (
        <div className="empty-state">Operators can monitor the published version and scale sync status. Publishing controls are admin-only.</div>
      )}

      <div className="version-history-heading">
        <div>
          <h4>Version history</h4>
          <p className="muted">Published versions include version number, publication date, publisher and package checksum.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => refetch()} disabled={versionsFetching}>
          {versionsFetching ? 'Refreshing...' : 'Refresh history'}
        </button>
      </div>

      {versionsLoading && <div className="status status-loading">Loading version history...</div>}
      {versionsErrorMessage && <div className="form-error" role="alert">{versionsErrorMessage}</div>}
      {!versionsLoading && !versionsErrorMessage && versions.length === 0 && <div className="empty-state">No published versions yet.</div>}
      {versions.length > 0 && (
        <div className="version-table-wrap">
          <table className="version-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Published at</th>
                <th>Published by</th>
                <th>Checksum</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id}>
                  <td>v{version.versionNumber}</td>
                  <td>{formatDateTime(version.publishedAt)}</td>
                  <td>{version.publishedBy ?? 'System'}</td>
                  <td><code title={version.checksum}>{shortChecksum(version.checksum)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function IssueList({ title, issues, emptyText, tone }: { title: string; issues: CatalogValidationIssue[]; emptyText: string; tone: 'error' | 'warning' }) {
  return (
    <div className={`issue-list issue-list-${tone}`}>
      <h4>{title}</h4>
      {issues.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul>
          {issues.map((issue, index) => (
            <li key={`${issue.code}-${issue.entityId ?? index}`}>
              <strong>{issue.code}</strong>
              <span>{issue.message}</span>
              {(issue.entityType || issue.entityId) && <small>{[issue.entityType, issue.entityId].filter(Boolean).join(' · ')}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PricesTab({ storeId }: { storeId: string }) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [missingPrice, setMissingPrice] = useState<'all' | 'missing' | 'priced'>('all');
  const missingPriceFilter = missingPrice === 'all' ? '' : missingPrice === 'missing';
  const { data, error, isLoading, isFetching, refetch } = useListStorePricesQuery({
    storeId,
    search,
    categoryId,
    missingPrice: missingPriceFilter,
  });
  const { data: unfilteredData } = useListStorePricesQuery({ storeId });
  const prices = data?.prices ?? [];
  const categoryOptions = useMemo(() => {
    const byId = new Map<string, PriceRow['category']>();
    for (const row of unfilteredData?.prices ?? prices) {
      byId.set(row.category.id, row.category);
    }
    return [...byId.values()].sort((first, second) => first.name.localeCompare(second.name));
  }, [prices, unfilteredData?.prices]);
  const errorMessage = error && 'message' in error ? error.message : null;

  return (
    <section className="prices-tab" aria-labelledby="prices-title">
      <div className="panel-heading prices-heading">
        <div>
          <p className="eyebrow">Prices tab</p>
          <h3 id="prices-title">Store product prices</h3>
          <p className="muted">Products from the active catalog for this store.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing...' : 'Refresh prices'}
        </button>
      </div>

      <div className="price-filters">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, short name, PLU, SKU or barcode"
          />
        </label>
        <label>
          Category
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          Price status
          <select value={missingPrice} onChange={(event) => setMissingPrice(event.target.value as 'all' | 'missing' | 'priced')}>
            <option value="all">All products</option>
            <option value="missing">Missing price only</option>
            <option value="priced">With price only</option>
          </select>
        </label>
      </div>

      {isLoading && <div className="status status-loading">Loading active catalog prices...</div>}
      {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}
      {!isLoading && !errorMessage && prices.length === 0 && <div className="empty-state">No products match these price filters.</div>}
      {prices.length > 0 && (
        <div className="price-table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th>Product name</th>
                <th>Short name</th>
                <th>PLU</th>
                <th>SKU/barcode</th>
                <th>Category</th>
                <th>Current price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>UpdatedAt</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((row) => (
                <PriceTableRow key={row.placement.id} row={row} storeId={storeId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PriceTableRow({ row, storeId }: { row: PriceRow; storeId: string }) {
  const currentPriceValue = row.currentPrice?.price ?? '';
  const [priceValue, setPriceValue] = useState(currentPriceValue);
  const [rowError, setRowError] = useState<string | null>(null);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [updatePrice, { isLoading }] = useUpdateStoreProductPriceMutation();
  const numericPrice = Number(priceValue);
  const currentPriceNumber = Number(row.currentPrice?.price);
  const hasInvalidSavedPrice = Boolean(row.currentPrice) && (!Number.isFinite(currentPriceNumber) || currentPriceNumber <= 0);
  const hasInvalidPrice = priceValue.trim() !== '' && (!Number.isFinite(numericPrice) || numericPrice <= 0);
  const isDirty = priceValue.trim() !== currentPriceValue;
  const rowClassName = [
    'price-row',
    row.missingPrice ? 'price-row-missing' : '',
    hasInvalidPrice || hasInvalidSavedPrice ? 'price-row-invalid' : '',
  ].filter(Boolean).join(' ');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRowError(null);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setRowError('Enter a price greater than 0.');
      return;
    }

    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      setRowError('Не удалось подготовить защищённую форму. Повторите попытку.');
      return;
    }

    try {
      const response = await updatePrice({
        storeId,
        productId: row.product.id,
        price: numericPrice,
        currency: row.currentPrice?.currency ?? 'RUB',
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setPriceValue(response.price.price);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Price could not be saved.';
      setRowError(message);
    }
  }

  return (
    <tr className={rowClassName}>
      <td>
        <strong>{row.product.name}</strong>
        {row.missingPrice && <span className="price-warning">No price</span>}
        {(hasInvalidPrice || hasInvalidSavedPrice) && <span className="price-warning">Invalid price</span>}
      </td>
      <td>{row.product.shortName}</td>
      <td>{row.product.defaultPluCode}</td>
      <td>{[row.product.sku, row.product.barcode].filter(Boolean).join(' / ') || '—'}</td>
      <td>{row.category.name}</td>
      <td>
        <form className="inline-price-form" onSubmit={handleSubmit}>
          <input
            aria-label={`Price for ${row.product.name}`}
            inputMode="decimal"
            min="0.01"
            onChange={(event) => setPriceValue(event.target.value)}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={priceValue}
          />
          <button type="submit" disabled={isLoading || hasInvalidPrice || !isDirty}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
        {rowError && <div className="inline-error" role="alert">{rowError}</div>}
      </td>
      <td>{row.product.unit}</td>
      <td><span className={`badge badge-${row.product.status}`}>{row.product.status}</span></td>
      <td>{row.currentPrice ? new Date(row.currentPrice.updatedAt).toLocaleString() : '—'}</td>
    </tr>
  );
}

function StoreForm({ mode, store, onCancel, onSaved }: { mode: 'create' | 'edit'; store?: Store; onCancel: () => void; onSaved: (store: Store) => void }) {
  const [values, setValues] = useState<StoreFormValues>({
    code: store?.code ?? '',
    name: store?.name ?? '',
    address: store?.address ?? '',
    timezone: store?.timezone ?? 'Europe/Moscow',
    status: store?.status ?? 'active',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [createStore, { isLoading: creating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: updating }] = useUpdateStoreMutation();
  const isSaving = creating || updating;

  function updateValue(field: keyof StoreFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!values.code.trim() || !values.name.trim()) {
      setFormError('Store code and name are required.');
      return;
    }

    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      setFormError('Не удалось подготовить защищённую форму. Повторите попытку.');
      return;
    }

    const payload = {
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
      address: values.address?.trim(),
      timezone: values.timezone?.trim() || 'Europe/Moscow',
      status: values.status,
      csrfToken: csrfData.csrfToken,
      csrfHeaderName: csrfData.headerName,
    };

    try {
      const response = mode === 'create'
        ? await createStore(payload).unwrap()
        : await updateStore({ ...payload, storeId: store!.id }).unwrap();
      onSaved(response.store);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Store could not be saved.';
      setFormError(message);
    }
  }

  return (
    <section className="panel" aria-labelledby="store-form-title">
      <button className="link-button" type="button" onClick={onCancel}>← Back to stores</button>
      <p className="eyebrow">{mode === 'create' ? 'Create store' : 'Edit store'}</p>
      <h2 id="store-form-title">{mode === 'create' ? 'New store' : store?.name}</h2>

      <form className="store-form" onSubmit={handleSubmit}>
        <label>
          Store code
          <input value={values.code} onChange={(event) => updateValue('code', event.target.value)} placeholder="STORE-002" />
        </label>
        <label>
          Store name
          <input value={values.name} onChange={(event) => updateValue('name', event.target.value)} placeholder="Central Store" />
        </label>
        <label>
          Address
          <input value={values.address ?? ''} onChange={(event) => updateValue('address', event.target.value)} placeholder="City, street" />
        </label>
        <label>
          Timezone
          <input value={values.timezone ?? ''} onChange={(event) => updateValue('timezone', event.target.value)} placeholder="Europe/Moscow" />
        </label>
        <label>
          Status
          <select value={values.status} onChange={(event) => updateValue('status', event.target.value as StoreStatus)}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="archived">archived</option>
          </select>
        </label>

        {formError && <div className="form-error" role="alert">{formError}</div>}
        <div className="action-row">
          <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save store'}</button>
          <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
}

function StoreEditRoute({ storeId, onNavigate }: { storeId: string; onNavigate: (view: DashboardView) => void }) {
  const { data, error, isLoading } = useGetStoreQuery(storeId);
  const errorMessage = error && 'message' in error ? error.message : null;

  if (isLoading) {
    return <section className="panel"><div className="status status-loading">Loading store for editing...</div></section>;
  }

  if (errorMessage || !data?.store) {
    return <section className="panel"><div className="form-error" role="alert">{errorMessage ?? 'Store not found.'}</div></section>;
  }

  return (
    <StoreForm
      mode="edit"
      store={data.store}
      onCancel={() => onNavigate({ name: 'store-details', storeId })}
      onSaved={(savedStore) => onNavigate({ name: 'store-details', storeId: savedStore.id })}
    />
  );
}

function AccessDeniedPanel() {
  return (
    <section className="panel" aria-labelledby="access-denied-title">
      <p className="eyebrow">Access denied</p>
      <h2 id="access-denied-title">Users & Access is admin-only</h2>
      <p className="muted">Operators cannot open user management controls. Ask an admin if your account needs additional store access.</p>
    </section>
  );
}

function getDefaultInviteExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 16);
}

function UsersAccessPage({ currentUser }: { currentUser: AuthUser }) {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useListUsersQuery({ includeDeleted });
  const users = data?.users ?? [];
  const errorMessage = error && 'message' in error ? error.message : null;

  return (
    <section className="panel" aria-labelledby="users-access-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Users & Access</p>
          <h2 id="users-access-title">Invites, roles and operator stores</h2>
          <p className="muted">Create admin/operator invites, change roles, block users and manage operator store assignments.</p>
        </div>
        <div className="action-row">
          <label className="compact-checkbox">
            <input type="checkbox" checked={includeDeleted} onChange={(event) => setIncludeDeleted(event.target.checked)} />
            Include deleted
          </label>
          <button className="secondary-button" type="button" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh users'}
          </button>
        </div>
      </div>

      <InviteForm />

      {isLoading && <div className="status status-loading">Loading users...</div>}
      {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}
      {!isLoading && !errorMessage && users.length === 0 && <div className="empty-state">No users found.</div>}
      {users.length > 0 && (
        <div className="users-list">
          {users.map((managedUser) => (
            <UserAccessCard key={managedUser.id} user={managedUser} currentUser={currentUser} />
          ))}
        </div>
      )}
    </section>
  );
}

function InviteForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AuthUser['role']>('operator');
  const [expiresAt, setExpiresAt] = useState(getDefaultInviteExpiry());
  const [formError, setFormError] = useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = useState<{ email: string; token: string; expiresAt: string } | null>(null);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [createInvite, { isLoading }] = useCreateInviteMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setCreatedInvite(null);

    if (!email.trim()) {
      setFormError('Email is required.');
      return;
    }

    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) {
      setFormError('Не удалось подготовить защищённую форму. Повторите попытку.');
      return;
    }

    try {
      const response = await createInvite({
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        role,
        expiresAt: new Date(expiresAt).toISOString(),
        csrfToken: csrfData.csrfToken,
        csrfHeaderName: csrfData.headerName,
      }).unwrap();
      setCreatedInvite({ email: response.invite.email, token: response.token, expiresAt: response.invite.expiresAt });
      setEmail('');
      setFullName('');
      setRole('operator');
      setExpiresAt(getDefaultInviteExpiry());
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Invite could not be created.';
      setFormError(message);
    }
  }

  return (
    <form className="invite-form" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Create invite</p>
        <p className="muted">Send this one-time token to the invited user through a secure channel.</p>
      </div>
      <div className="invite-grid">
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="operator@example.com" /></label>
        <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Optional" /></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value as AuthUser['role'])}><option value="operator">operator</option><option value="admin">admin</option></select></label>
        <label>Expires at<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
      </div>
      {formError && <div className="form-error" role="alert">{formError}</div>}
      {createdInvite && (
        <div className="status status-ok" role="status">
          Invite for <strong>{createdInvite.email}</strong> expires {formatDateTime(createdInvite.expiresAt)}.<br />
          Token: <code>{createdInvite.token}</code>
        </div>
      )}
      <button type="submit" disabled={isLoading}>{isLoading ? 'Creating invite...' : 'Create invite'}</button>
    </form>
  );
}

function UserAccessCard({ user, currentUser }: { user: ManagedUser; currentUser: AuthUser }) {
  const [rowError, setRowError] = useState<string | null>(null);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [changeRole, { isLoading: changingRole }] = useChangeUserRoleMutation();
  const [blockUser, { isLoading: blocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: unblocking }] = useUnblockUserMutation();
  const isDeleted = Boolean(user.deletedAt);
  const isSelf = currentUser.id === user.id;
  const statusClass = user.status === 'blocked' ? 'badge-blocked' : user.status === 'active' ? 'badge-active' : 'badge-inactive';

  async function getCsrfOrThrow() {
    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) throw new Error('Не удалось подготовить защищённую форму. Повторите попытку.');
    return csrfData;
  }

  async function runAction(action: (csrfData: { csrfToken: string; headerName: string }) => Promise<unknown>) {
    setRowError(null);
    try {
      await action(await getCsrfOrThrow());
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'User update failed.';
      setRowError(message);
    }
  }

  return (
    <article className="user-card">
      <div className="user-card-main">
        <div>
          <p className="store-code">{user.email}</p>
          <h3>{user.fullName || 'Unnamed user'}</h3>
          <p className="muted">Created {formatDateTime(user.createdAt)} · Last login {formatDateTime(user.lastLoginAt)}</p>
        </div>
        <div className="store-actions">
          <span className={`badge ${statusClass}`}>{isDeleted ? 'deleted' : user.status}</span>
          <label className="role-control">
            Role
            <select
              value={user.role}
              disabled={isDeleted || changingRole}
              onChange={(event) => runAction((csrfData) => changeRole({ userId: user.id, role: event.target.value as AuthUser['role'], csrfToken: csrfData.csrfToken, csrfHeaderName: csrfData.headerName }).unwrap())}
            >
              <option value="operator">operator</option>
              <option value="admin">admin</option>
            </select>
          </label>
          {user.status === 'blocked' ? (
            <button className="secondary-button" type="button" disabled={isDeleted || unblocking} onClick={() => runAction((csrfData) => unblockUser({ userId: user.id, csrfToken: csrfData.csrfToken, csrfHeaderName: csrfData.headerName }).unwrap())}>
              {unblocking ? 'Unblocking...' : 'Unblock'}
            </button>
          ) : (
            <button className="secondary-button" type="button" disabled={isDeleted || blocking || isSelf} onClick={() => runAction((csrfData) => blockUser({ userId: user.id, csrfToken: csrfData.csrfToken, csrfHeaderName: csrfData.headerName }).unwrap())}>
              {blocking ? 'Blocking...' : 'Block'}
            </button>
          )}
        </div>
      </div>
      {rowError && <div className="inline-error" role="alert">{rowError}</div>}
      {user.role === 'operator' && !isDeleted && <OperatorStoreAccess userId={user.id} />}
    </article>
  );
}

function OperatorStoreAccess({ userId }: { userId: string }) {
  const [storeId, setStoreId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: accessData, error: accessError, isLoading: accessLoading } = useListUserStoreAccessesQuery(userId);
  const { data: storesData } = useListStoresQuery();
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [grantStoreAccess, { isLoading: granting }] = useGrantStoreAccessMutation();
  const [revokeStoreAccess, { isLoading: revoking }] = useRevokeStoreAccessMutation();
  const activeAccesses = (accessData?.storeAccesses ?? []).filter((access) => !access.revokedAt);
  const activeStoreIds = new Set(activeAccesses.map((access) => access.storeId));
  const availableStores = (storesData?.stores ?? []).filter((store) => store.status !== 'archived' && !activeStoreIds.has(store.id));
  const accessErrorMessage = accessError && 'message' in accessError ? accessError.message : null;

  async function getCsrfOrThrow() {
    const csrfData = csrf ?? (await refetchCsrf()).data;
    if (!csrfData) throw new Error('Не удалось подготовить защищённую форму. Повторите попытку.');
    return csrfData;
  }

  async function handleGrant() {
    setActionError(null);
    if (!storeId) {
      setActionError('Choose a store to assign.');
      return;
    }
    try {
      const csrfData = await getCsrfOrThrow();
      await grantStoreAccess({ userId, storeId, csrfToken: csrfData.csrfToken, csrfHeaderName: csrfData.headerName }).unwrap();
      setStoreId('');
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Store access could not be assigned.';
      setActionError(message);
    }
  }

  async function handleRevoke(revokeStoreId: string) {
    setActionError(null);
    try {
      const csrfData = await getCsrfOrThrow();
      await revokeStoreAccess({ userId, storeId: revokeStoreId, csrfToken: csrfData.csrfToken, csrfHeaderName: csrfData.headerName }).unwrap();
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Store access could not be revoked.';
      setActionError(message);
    }
  }

  return (
    <div className="store-access-box">
      <div className="store-access-header">
        <h4>Operator store access</h4>
        <div className="access-grant-row">
          <select value={storeId} onChange={(event) => setStoreId(event.target.value)} aria-label="Store to assign">
            <option value="">Choose store</option>
            {availableStores.map((store) => <option key={store.id} value={store.id}>{store.code} · {store.name}</option>)}
          </select>
          <button type="button" disabled={granting || !storeId} onClick={handleGrant}>{granting ? 'Assigning...' : 'Assign store'}</button>
        </div>
      </div>
      {accessLoading && <div className="status status-loading">Loading store access...</div>}
      {accessErrorMessage && <div className="form-error" role="alert">{accessErrorMessage}</div>}
      {actionError && <div className="inline-error" role="alert">{actionError}</div>}
      {!accessLoading && activeAccesses.length === 0 && <div className="empty-state">No active stores assigned.</div>}
      {activeAccesses.length > 0 && (
        <div className="access-list">
          {activeAccesses.map((access) => (
            <div className="access-item" key={access.id}>
              <span><strong>{access.store.code}</strong> · {access.store.name}</span>
              <button className="secondary-button" type="button" disabled={revoking} onClick={() => handleRevoke(access.storeId)}>
                {revoking ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardContent({ user, view, onNavigate }: { user: AuthUser; view: DashboardView; onNavigate: (view: DashboardView) => void }) {
  if (view.name === 'users-access') {
    return user.role === 'admin' ? <UsersAccessPage currentUser={user} /> : <AccessDeniedPanel />;
  }

  if (view.name === 'stores') {
    return <StoresList user={user} onNavigate={onNavigate} />;
  }

  if (view.name === 'store-details') {
    return <StoreDetails user={user} storeId={view.storeId} onNavigate={onNavigate} />;
  }

  if (view.name === 'store-create' && user.role === 'admin') {
    return <StoreForm mode="create" onCancel={() => onNavigate({ name: 'stores' })} onSaved={(store) => onNavigate({ name: 'store-details', storeId: store.id })} />;
  }

  if (view.name === 'store-edit' && user.role === 'admin') {
    return <StoreEditRoute storeId={view.storeId} onNavigate={onNavigate} />;
  }

  return <HealthStatus />;
}

function viewFromHash(): DashboardView {
  return window.location.hash === '#users-access' ? { name: 'users-access' } : { name: 'overview' };
}

function hashFromView(view: DashboardView) {
  return view.name === 'users-access' ? '#users-access' : '';
}

function Dashboard({ user }: { user: AuthUser }) {
  const [view, setView] = useState<DashboardView>(viewFromHash);
  const { data: csrf, refetch: refetchCsrf } = useGetCsrfTokenQuery();
  const [logout, { isLoading: logoutLoading, error: logoutError }] = useLogoutMutation();

  useEffect(() => {
    function handleHashChange() {
      setView(viewFromHash());
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleNavigate(nextView: DashboardView) {
    const hash = hashFromView(nextView);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setView(nextView);
  }

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

      <Navigation user={user} activeView={view} onNavigate={handleNavigate} />
      {logoutErrorMessage && <div className="form-error" role="alert">{logoutErrorMessage}</div>}
      <DashboardContent user={user} view={view} onNavigate={handleNavigate} />
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
