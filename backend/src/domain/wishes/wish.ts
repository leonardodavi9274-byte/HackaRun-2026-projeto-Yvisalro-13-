/** Identificadores de produto e oferta permanecem distintos no catálogo. */
export type WishTarget =
  | { type: "product"; referenceId: string }
  | { type: "offer"; referenceId: string };

/** O proprietário deve vir da identidade validada pela API, não do cliente. */
export type Wish = {
  id: string;
  ownerId: string;
  target: WishTarget;
  createdAt: string;
};

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** A existência e a disponibilidade da referência são verificadas pelo catálogo. */
export function isWishTarget(value: unknown): value is WishTarget {
  if (!value || typeof value !== "object") return false;
  const target = value as Record<string, unknown>;
  return (target.type === "product" || target.type === "offer") && nonEmpty(target.referenceId);
}

/** Não confirma autenticação nem persistência; valida somente a forma do registro. */
export function isWish(value: unknown): value is Wish {
  if (!value || typeof value !== "object") return false;
  const wish = value as Record<string, unknown>;
  return nonEmpty(wish.id) && nonEmpty(wish.ownerId) && isWishTarget(wish.target) &&
    nonEmpty(wish.createdAt) && Number.isFinite(Date.parse(wish.createdAt));
}
