function entryDescription(entry) {
  if (entry.type === "search") return `Busca: ${entry.term}`;
  const label = typeof entry.label === "string" && entry.label.trim()
    ? entry.label : "Produto ou oferta visualizada";
  return `Visualização: ${label}`;
}

/** A lista e as confirmações são fornecidas pelo estado autenticado da aplicação. */
export function HistoryView({
  authenticated = false,
  entries = [],
  loading = false,
  offline = false,
  error = null,
  pendingIds = [],
  uncertainIds = [],
  onRemove,
  onRetry,
}) {
  const message = typeof error === "string" ? error : error?.message;
  const unavailable = !authenticated || loading || offline || Boolean(error);
  const canRetry = typeof onRetry === "function";

  return (
    <main>
      <h1>Histórico de produtos</h1>
      {!authenticated && <p>Entre na sua conta para consultar o histórico.</p>}
      {authenticated && loading && <p role="status">Carregando histórico…</p>}
      {authenticated && offline && <p role="status">Sem conexão. Conecte-se para consultar o histórico.</p>}
      {authenticated && message && <p role="alert">{message}</p>}
      {authenticated && (offline || error) && canRetry && (
        <button type="button" onClick={onRetry}>Tentar novamente</button>
      )}
      {!unavailable && entries.length === 0 && <p>Seu histórico está vazio.</p>}
      {!unavailable && entries.length > 0 && (
        <ul>
          {entries.map((entry) => {
            const description = entryDescription(entry);
            const pending = pendingIds.includes(entry.id);
            const uncertain = uncertainIds.includes(entry.id);
            return (
              <li key={entry.id}>
                <span>{description}</span>{" "}
                <button
                  type="button"
                  aria-label={`Excluir ${description} do histórico`}
                  disabled={pending || uncertain || typeof onRemove !== "function"}
                  onClick={() => onRemove(entry.id)}
                >
                  Excluir
                </button>
                {pending && <p role="status">Aguardando confirmação da exclusão…</p>}
                {uncertain && (
                  <p role="status">Não foi possível confirmar a exclusão. Atualize o histórico antes de tentar novamente.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {!unavailable && uncertainIds.length > 0 && canRetry && (
        <button type="button" onClick={onRetry}>Atualizar histórico</button>
      )}
    </main>
  );
}
