export type Point2 = [number, number];
export type PointKind = "entrance" | "escalator" | "stairs" | "elevator" | "landmark";
export type EdgeKind = "walk" | "escalator" | "stairs" | "elevator";
export type MapNode = { id: string; x: number; y: number };
export type MapUnit = { id: string; polygon: Point2[]; door: string; anchor: Point2 };
export type MapPoint = { id: string; kind: PointKind; label: string; node: string };
export type MapFloor = {
  id: string; label: string; name: string; order: number; width: number; height: number;
  outline: Point2[]; corridors: Point2[][]; units: MapUnit[]; points: MapPoint[]; nodes: MapNode[];
};
export type MapEdge = { from: string; to: string; kind: EdgeKind; lengthM?: number };
export type MapDocument = { schemaVersion: 1; floors: MapFloor[]; edges: MapEdge[] };

/** Motivo de invalidação; vai apenas para o log, nunca para a resposta HTTP. */
export class MapDocumentError extends Error {
  constructor(message: string) { super(message); this.name = "MapDocumentError"; }
}

const POINT_KINDS: readonly string[] = ["entrance", "escalator", "stairs", "elevator", "landmark"];
const FLOOR_LINKS: readonly string[] = ["escalator", "stairs", "elevator"];

const fail = (rule: number, detail: string): never => { throw new MapDocumentError(`regra ${rule}: ${detail}`); };
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, where: string): string => {
  if (typeof v !== "string" || !v.trim()) fail(1, `${where} deve ser texto não vazio`);
  return v as string;
};
const finite = (v: unknown, where: string): number => {
  if (typeof v !== "number" || !Number.isFinite(v)) fail(3, `${where} deve ser número finito`);
  return v as number;
};
const list = (v: unknown, where: string): unknown[] => {
  if (!Array.isArray(v)) fail(1, `${where} deve ser uma lista`);
  return v as unknown[];
};
const point2 = (v: unknown, where: string): Point2 => {
  if (!Array.isArray(v) || v.length !== 2) fail(3, `${where} deve ser [x, y]`);
  const pair = v as unknown[];
  return [finite(pair[0], where), finite(pair[1], where)];
};

/**
 * Valida o documento do mapa (schemaVersion 1) conforme as regras 1–7 de
 * specs/005-mapa-rota-lojas/data-model.md. Retorna o documento tipado ou lança
 * MapDocumentError. Unidade sem caminho não invalida o documento.
 */
export function validateMapDocument(input: unknown): MapDocument {
  if (!isObject(input)) return fail(1, "documento deve ser um objeto");
  if (input.schemaVersion !== 1) fail(1, "schemaVersion deve ser 1");
  const rawFloors = list(input.floors, "floors");
  if (!rawFloors.length) fail(1, "ao menos um piso é obrigatório");

  const ids = new Set<string>();
  const claim = (id: string) => { if (ids.has(id)) fail(1, `id repetido: ${id}`); ids.add(id); };
  const nodeFloor = new Map<string, string>();
  const nodeXY = new Map<string, Point2>();
  const orders = new Set<number>();
  const floors: MapFloor[] = [];
  const pendingRefs: Array<{ node: string; floorId: string; where: string }> = [];

  for (const [fi, raw] of rawFloors.entries()) {
    if (!isObject(raw)) return fail(1, `floors[${fi}] deve ser um objeto`);
    const id = text(raw.id, `floors[${fi}].id`); claim(id);
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    if (!label) fail(2, `label do piso ${id} vazio`);
    const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : label;
    const order = finite(raw.order, `order do piso ${id}`);
    if (!Number.isInteger(order) || orders.has(order)) fail(2, `order do piso ${id} ausente ou repetido`);
    orders.add(order);
    const width = finite(raw.width, `width do piso ${id}`);
    const height = finite(raw.height, `height do piso ${id}`);
    if (width <= 0 || height <= 0) fail(3, `dimensões do piso ${id} devem ser positivas`);

    const polygon = (v: unknown, where: string): Point2[] => {
      const pts = list(v, where).map((p, i) => point2(p, `${where}[${i}]`));
      if (pts.length < 3) fail(3, `${where} precisa de ao menos 3 vértices`);
      for (const [x, y] of pts) if (x < 0 || y < 0 || x > width || y > height) fail(3, `${where} fora de ${width} × ${height}`);
      return pts;
    };

    const nodes: MapNode[] = list(raw.nodes, `nós do piso ${id}`).map((n, i) => {
      if (!isObject(n)) return fail(1, `nó ${i} do piso ${id} inválido`);
      const nodeId = text(n.id, `nó ${i} do piso ${id}`); claim(nodeId);
      const x = finite(n.x, `x do nó ${nodeId}`), y = finite(n.y, `y do nó ${nodeId}`);
      nodeFloor.set(nodeId, id); nodeXY.set(nodeId, [x, y]);
      return { id: nodeId, x, y };
    });

    const units: MapUnit[] = list(raw.units, `unidades do piso ${id}`).map((u, i) => {
      if (!isObject(u)) return fail(1, `unidade ${i} do piso ${id} inválida`);
      const unitId = text(u.id, `unidade ${i} do piso ${id}`); claim(unitId);
      const door = text(u.door, `door da unidade ${unitId}`);
      pendingRefs.push({ node: door, floorId: id, where: `door da unidade ${unitId}` });
      return { id: unitId, polygon: polygon(u.polygon, `polígono da unidade ${unitId}`), door, anchor: point2(u.anchor, `anchor da unidade ${unitId}`) };
    });

    const points: MapPoint[] = list(raw.points, `pontos do piso ${id}`).map((p, i) => {
      if (!isObject(p)) return fail(1, `ponto ${i} do piso ${id} inválido`);
      const pointId = text(p.id, `ponto ${i} do piso ${id}`); claim(pointId);
      if (typeof p.kind !== "string" || !POINT_KINDS.includes(p.kind)) fail(7, `kind inválido no ponto ${pointId}`);
      const node = text(p.node, `node do ponto ${pointId}`);
      pendingRefs.push({ node, floorId: id, where: `node do ponto ${pointId}` });
      return { id: pointId, kind: p.kind as PointKind, label: text(p.label, `label do ponto ${pointId}`), node };
    });

    floors.push({
      id, label, name, order, width, height,
      outline: polygon(raw.outline, `contorno do piso ${id}`),
      corridors: list(raw.corridors ?? [], `corredores do piso ${id}`).map((c, i) => polygon(c, `corredor ${i} do piso ${id}`)),
      units, points, nodes,
    });
  }

  for (const ref of pendingRefs) {
    const floor = nodeFloor.get(ref.node);
    if (!floor) fail(4, `${ref.where} referencia nó inexistente ${ref.node}`);
    if (floor !== ref.floorId) fail(4, `${ref.where} referencia nó de outro piso`);
  }

  const edges: MapEdge[] = list(input.edges, "edges").map((e, i) => {
    if (!isObject(e)) return fail(5, `aresta ${i} inválida`);
    const from = text(e.from, `from da aresta ${i}`), to = text(e.to, `to da aresta ${i}`);
    const fromFloor = nodeFloor.get(from), toFloor = nodeFloor.get(to);
    if (!fromFloor || !toFloor) fail(4, `aresta ${i} referencia nó inexistente`);
    if (from === to) fail(5, `aresta ${i} liga o nó a ele mesmo`);
    if (e.kind === "walk") {
      if (fromFloor !== toFloor) fail(5, `aresta walk ${from}–${to} liga pisos diferentes`);
      return { from, to, kind: "walk" };
    }
    if (typeof e.kind !== "string" || !FLOOR_LINKS.includes(e.kind)) return fail(5, `kind inválido na aresta ${from}–${to}`);
    if (fromFloor === toFloor) fail(5, `aresta ${e.kind} ${from}–${to} deve ligar pisos diferentes`);
    const lengthM = finite(e.lengthM, `lengthM da aresta ${from}–${to}`);
    if (lengthM <= 0) fail(5, `lengthM da aresta ${from}–${to} deve ser maior que zero`);
    return { from, to, kind: e.kind as EdgeKind, lengthM };
  });

  return { schemaVersion: 1, floors, edges };
}

/** Índice unidade → piso do documento validado. */
export function unitFloorIndex(document: MapDocument): Map<string, string> {
  const index = new Map<string, string>();
  for (const floor of document.floors) for (const unit of floor.units) index.set(unit.id, floor.id);
  return index;
}
