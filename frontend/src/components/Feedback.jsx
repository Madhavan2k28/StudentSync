export function ErrorNote({ error }) {
  if (!error) return null;
  return <p className="note note-error" role="alert">{error}</p>;
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children && <div className="empty-body">{children}</div>}
    </div>
  );
}

export function Loading() {
  return <p className="loading">Loading…</p>;
}

export function Status({ value }) {
  return <span className={`status status-${value?.toLowerCase()}`}>{value?.[0] + value?.slice(1).toLowerCase()}</span>;
}
