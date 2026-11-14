import {CATEGORIES, PRODUCTS, STORIES, productById, storeById} from "../data/catalog.js";

export const formatPrice = cents => new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL", minimumFractionDigits: cents % 100 ? 2 : 0}).format(cents / 100);
export const discountPercent = offer => offer.previousCents ? Math.round((1 - offer.priceCents / offer.previousCents) * 100) : 0;
export const normalize = text => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Ofertas com estoque, da mais barata para a mais cara; depois as sem estoque. */
export function sortedOffers(product) {
  return [...product.offers].sort((a, b) => (b.stock > 0) - (a.stock > 0) || a.priceCents - b.priceCents);
}
export const bestOffer = product => sortedOffers(product)[0];
export const inStockOffers = product => product.offers.filter(o => o.stock > 0);

/** Maior desconto entre os produtos de uma categoria (para os atalhos "Pra você"). */
export function categoryDiscount(categoryId) {
  return Math.max(0, ...PRODUCTS.filter(p => p.categoryId === categoryId)
    .flatMap(p => p.offers.filter(o => o.stock > 0).map(discountPercent)));
}

export function storiesByStore() {
  const map = new Map();
  for (const story of STORIES) {
    const product = productById(story.productId), offer = product?.offers.find(o => o.storeId === story.storeId);
    if (!product || !offer) continue;
    if (!map.has(story.storeId)) map.set(story.storeId, []);
    map.get(story.storeId).push({...story, product, offer, store: storeById(story.storeId)});
  }
  return map;
}

const STOP = new Set(["de", "do", "da", "para", "pra", "com", "e", "o", "a", "os", "as", "um", "uma", "no", "na"]);
/** Termos amplos que o usuário digita e o rótulo exibido em "Entendemos". */
const SYNONYMS = {bluetooth: "sem fio", wireless: "sem fio", tenis: "tênis", headphone: "fone"};

/**
 * Interpreta "fone bluetooth até 300": termos, preço máximo e a explicação exibida.
 * Valores aceitos: "até 300", "ate 300,50", "até R$ 300", "abaixo de 300".
 */
export function parseQuery(raw) {
  const text = normalize(raw ?? "");
  let maxCents = null;
  const priceMatch = text.match(/(?:ate|abaixo de|menos de|max(?:imo)?)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
  let rest = text;
  if (priceMatch) {
    maxCents = Math.round(Number(priceMatch[1].replace(",", ".")) * 100);
    rest = text.replace(priceMatch[0], " ");
  }
  const tokens = rest.split(/[^a-z0-9-]+/).filter(t => t && !STOP.has(t));
  return {raw: raw ?? "", tokens, maxCents};
}

function productScore(product, tokens) {
  if (!tokens.length) return 1;
  const name = normalize(product.name), terms = product.terms.map(normalize), category = normalize(CATEGORIES.find(c => c.id === product.categoryId)?.label ?? "");
  let score = 0;
  for (const token of tokens) {
    const t = normalize(SYNONYMS[token] ?? token);
    const variants = [token, t, token.replace(/s$/, "")];
    if (variants.some(v => name.split(/\s+/).includes(v))) score += 3;
    else if (variants.some(v => terms.includes(v))) score += 2;
    else if (variants.some(v => v.length >= 3 && (name.includes(v) || terms.some(term => term.includes(v)) || category.includes(v)))) score += 1;
    else return 0; // todos os termos precisam ser atendidos
  }
  return score;
}

/**
 * Resultados por oferta (produto × loja). Regra da especificação: relevância primeiro e, entre
 * resultados igualmente relevantes, menor preço; itens sem estoque sempre por último.
 */
export function searchCatalog(raw, {onlyPromo = false, onlyInStock = false, type = null} = {}) {
  const query = parseQuery(raw);
  const matches = PRODUCTS.map(p => ({product: p, score: productScore(p, query.tokens)})).filter(m => m.score > 0);
  let results = matches.flatMap(({product, score}) => product.offers.map(offer => ({product, offer, store: storeById(offer.storeId), score})));
  if (query.maxCents !== null) results = results.filter(r => r.offer.priceCents <= query.maxCents);
  const types = [...new Set(results.map(r => r.product.type).filter(Boolean))];
  if (onlyPromo) results = results.filter(r => r.offer.previousCents);
  if (onlyInStock) results = results.filter(r => r.offer.stock > 0);
  if (type) results = results.filter(r => r.product.type === type);
  results.sort((a, b) => (b.offer.stock > 0) - (a.offer.stock > 0) || b.score - a.score || a.offer.priceCents - b.offer.priceCents);
  return {query, results, types, understood: understood(query, matches.map(m => m.product))};
}

function understood(query, products) {
  const groups = [...new Set(products.map(p => p.group))];
  let subject = query.tokens.join(" ");
  if (groups.length === 1 && query.tokens.length) {
    const noun = {fones: "fones", tenis: "tênis", jaquetas: "jaquetas", cafeteiras: "cafeteiras", skincare: "skincare"}[groups[0]] ?? subject;
    subject = query.tokens.some(t => SYNONYMS[t] === "sem fio" || t === "sem") ? `${noun} sem fio` : noun;
  }
  return {subject, maxCents: query.maxCents};
}

/** Comparação "X em N lojas. Na A sai R$ D mais barato que na B" para o produto do topo. */
export function comparison(results) {
  const first = results.find(r => r.offer.stock > 0);
  if (!first) return null;
  const offers = inStockOffers(first.product).sort((a, b) => a.priceCents - b.priceCents);
  if (offers.length < 2) return null;
  const cheapest = offers[0], priciest = offers.at(-1);
  return {product: first.product, count: offers.length, cheapest: storeById(cheapest.storeId), priciest: storeById(priciest.storeId), diffCents: priciest.priceCents - cheapest.priceCents};
}

/** Linha de desejo: menor preço atual, queda desde que foi salvo e loja mais barata. */
export function wishSummary(wish) {
  const product = productById(wish.productId);
  if (!product) return null;
  const offer = bestOffer(product), available = inStockOffers(product);
  return {product, offer, store: storeById(offer.storeId), storeCount: product.offers.length,
    dropCents: Math.max(0, wish.savedCents - offer.priceCents), available: available.length > 0};
}

export function recommendations({categoryIds = [], exclude = []} = {}) {
  const excluded = new Set(exclude);
  const scored = PRODUCTS.filter(p => !excluded.has(p.id) && inStockOffers(p).length)
    .map(p => ({product: p, offer: bestOffer(p), weight: (categoryIds.includes(p.categoryId) ? 2 : 0) + (bestOffer(p).previousCents ? 1 : 0)}));
  return scored.sort((a, b) => b.weight - a.weight || a.offer.priceCents - b.offer.priceCents).slice(0, 8);
}
