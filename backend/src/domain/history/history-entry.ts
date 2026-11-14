export type ViewedTarget = {
  type: "product" | "offer";
  referenceId: string;
};

type HistoryIdentity = {
  id: string;
  /** Identidade validada pela API; nunca confiar no proprietário enviado pelo cliente. */
  ownerId: string;
  occurredAt: string;
};

export type HistoryEntry = HistoryIdentity & (
  | { type: "search"; term: string }
  | { type: "view"; target: ViewedTarget }
);

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isViewedTarget(value: unknown): value is ViewedTarget {
  if (!value || typeof value !== "object") return false;
  const target = value as Record<string, unknown>;
  return (target.type === "product" || target.type === "offer") && nonEmpty(target.referenceId);
}

/** Uma entrada descreve uma interação; não confirma autenticação ou persistência. */
export function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  if (!nonEmpty(entry.id) || !nonEmpty(entry.ownerId) || !nonEmpty(entry.occurredAt) ||
      !Number.isFinite(Date.parse(entry.occurredAt))) return false;
  return (entry.type === "search" && nonEmpty(entry.term)) ||
    (entry.type === "view" && isViewedTarget(entry.target));
}
