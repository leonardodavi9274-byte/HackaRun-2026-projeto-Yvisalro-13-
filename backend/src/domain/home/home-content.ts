// Agregado público da tela inicial (contrato: specs/006-tela-inicial-descoberta/contracts/api.md).
// Preços em centavos inteiros BRL; datas ISO 8601 UTC; nenhum dado pessoal.
export const HOME_LIMITS = Object.freeze({categories: 12, stories: 10, featuredOffers: 8, carousels: 6, carouselProducts: 10});

export type SectionStatus = "ready" | "empty" | "unavailable";
export type HomeSection<T> = {status: SectionStatus; items: T[]};
export type StockStatus = "in_stock" | "out_of_stock" | "unknown";

export type HomeShopping = {id: string; name: string; isDemo: boolean};
export type HomeCategory = {id: string; label: string; isDemo: boolean};
export type HomeStore = {id: string; name: string; floorLabel: string | null};
export type HomeProduct = {id: string; name: string; imageUrl: string | null; imageAlt: string | null};
export type HomeOffer = {
  offerId: string; product: HomeProduct; store: HomeStore;
  priceCents: number; currency: "BRL"; previousPriceCents: number | null;
  stockStatus: StockStatus; validUntil: string | null; lastUpdatedAt: string; isDemo: boolean;
};
export type HomeStory = {
  id: string; title: string; imageUrl: string; imageAlt: string; store: HomeStore;
  offer: HomeOffer | null; validUntil: string; isDemo: boolean;
};
export type HomeCarouselProduct = {position: number; product: HomeProduct; offer: HomeOffer | null; isDemo: boolean};
export type HomeCarousel = {id: string; title: string; source: "editorial"; isDemo: boolean; products: HomeCarouselProduct[]};

export type HomeSections = {
  categories: HomeSection<HomeCategory>;
  stories: HomeSection<HomeStory>;
  featuredOffers: HomeSection<HomeOffer>;
  carousels: HomeSection<HomeCarousel>;
};
export type HomeResponse = {generatedAt: string; shopping: HomeShopping | null; sections: HomeSections};

export const utc = (value: string) => new Date(value).toISOString();
// Preço anterior só é exibido quando coerente (maior que o atual).
export const previousPrice = (price: number, previous: number | null) => previous !== null && previous > price ? previous : null;
