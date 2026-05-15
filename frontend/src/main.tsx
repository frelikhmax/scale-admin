import { type FormEvent, StrictMode, useMemo, useState } from 'react';
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
  useCreateStoreMutation,
  useGetStoreQuery,
  useListStoresQuery,
  useUpdateStoreMutation,
  type Store,
  type StoreFormValues,
  type StoreStatus,
} from './features/stores/storesApi';
import './styles.css';

type DashboardView =
  | { name: 'overview' }
  | { name: 'stores' }
  | { name: 'store-details'; storeId: string }
  | { name: 'store-create' }
  | { name: 'store-edit'; storeId: string };

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
        <button className="nav-button" type="button" onClick={() => onNavigate({ name: 'store-create' })}>
          Create store
        </button>
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
  const store = data?.store;
  const errorMessage = error && 'message' in error ? error.message : null;

  return (
    <section className="panel" aria-labelledby="store-details-title">
      <button className="link-button" type="button" onClick={() => onNavigate({ name: 'stores' })}>
        ← Back to stores
      </button>
      {isLoading && <div className="status status-loading">Loading store details...</div>}
      {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}
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
            <div><dt>Created</dt><dd>{new Date(store.createdAt).toLocaleString()}</dd></div>
            <div><dt>Updated</dt><dd>{new Date(store.updatedAt).toLocaleString()}</dd></div>
          </dl>
          <PricesTab storeId={store.id} />
        </>
      )}
    </section>
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

function DashboardContent({ user, view, onNavigate }: { user: AuthUser; view: DashboardView; onNavigate: (view: DashboardView) => void }) {
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

function Dashboard({ user }: { user: AuthUser }) {
  const [view, setView] = useState<DashboardView>({ name: 'overview' });
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

      <Navigation user={user} activeView={view} onNavigate={setView} />
      {logoutErrorMessage && <div className="form-error" role="alert">{logoutErrorMessage}</div>}
      <DashboardContent user={user} view={view} onNavigate={setView} />
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
