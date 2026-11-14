const LABELS = { product: "produto", offer: "oferta desta loja" };

/** O estado salvo é fornecido pela consulta confirmada; este componente não o antecipa. */
export function WishToggle({ authenticated = false, productId, offerId, states = {}, onChange }) {
  return (
    <fieldset className="wish-toggle">
      <legend>Escolha o que salvar nos desejos</legend>
      {!authenticated && <p>Entre na sua conta para salvar desejos.</p>}
      {["product", "offer"].map((type) => {
        const referenceId = type === "product" ? productId : offerId;
        const state = states[type] ?? {};
        const known = typeof state.saved === "boolean";
        const saved = state.saved === true;
        const pending = state.pending === true;
        const actionable = authenticated && Boolean(referenceId) && known && !pending &&
          typeof onChange === "function";
        const error = typeof state.error === "string" ? state.error : state.error?.message;
        const action = saved ? `Remover ${LABELS[type]} dos desejos` : `Salvar ${LABELS[type]} nos desejos`;

        return (
          <div key={type}>
            <button
              type="button"
              aria-pressed={known ? saved : undefined}
              disabled={!actionable}
              onClick={() => onChange(type, referenceId, !saved)}
            >
              {action}
            </button>
            {pending && <p role="status">Aguardando confirmação para {LABELS[type]}…</p>}
            {authenticated && !referenceId && <p>Identificação de {LABELS[type]} indisponível.</p>}
            {authenticated && referenceId && !known && !pending && !error && (
              <p role="status">Consultando o estado de {LABELS[type]} nos desejos.</p>
            )}
            {error && <p role="alert">{error}</p>}
          </div>
        );
      })}
    </fieldset>
  );
}
