import type {Promotion} from "../../domain/promotions/promotion.ts";
import type {PromotionRepository} from "../../application/ports/promotion-repository.ts";
import {DEMO_MALL_ID} from "./demo-mall.repository.ts";

type Seed = Omit<Promotion, "revision" | "startsAt" | "endsAt" | "updatedAt" | "isDemo" | "published"> & {hours: number};

/** Ofertas fictícias das telas 05, 07 e 11 (as mesmas de 0022_prototype_demo_stores.sql). */
const SEEDS: Seed[] = [
  {id: "cafe-pao-de-queijo-grao-fino", storeId: "grao-fino", categoryId: "cafe-doces", productName: "Café + pão de queijo", priceCents: 1290, previousPriceCents: 1520, availability: "available", hours: 6},
  {id: "jaqueta-corta-vento-moda-leve", storeId: "moda-leve", categoryId: "moda", productName: "Jaqueta corta-vento", priceCents: 13900, previousPriceCents: 19900, availability: "available", hours: 48},
  {id: "fone-orbit-x-pixel-house", storeId: "pixel-house", categoryId: "eletronicos", productName: "Fone Orbit X", priceCents: 22900, previousPriceCents: 29900, availability: "available", hours: 3},
];

/** Vigência relativa ao início do processo (horas a partir de agora), para a demonstração não expirar logo. */
export class DemoPromotionRepository implements PromotionRepository {
  readonly offers: Promotion[];
  constructor(now = Date.now()) {
    const updatedAt = new Date(now - 2 * 3600_000).toISOString();
    this.offers = SEEDS.map(({hours, ...s}) => ({
      ...s, revision: 1, startsAt: null, endsAt: new Date(now + hours * 3600_000).toISOString(),
      updatedAt, isDemo: true, published: true,
    }));
  }
  async isActiveMall(mallId: string) { return mallId === DEMO_MALL_ID; }
  async list(mallId: string) { return mallId === DEMO_MALL_ID ? this.offers.map(o => ({...o})) : []; }
  async find(mallId: string, id: string) { return mallId === DEMO_MALL_ID ? this.offers.find(o => o.id === id) ?? null : null; }
}
