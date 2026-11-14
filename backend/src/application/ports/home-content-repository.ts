import type {HomeCarousel,HomeCategory,HomeOffer,HomeShopping,HomeStory} from "../../domain/home/home-content.ts";
export interface HomeContentRepository {
  defaultShopping(): Promise<HomeShopping | null>;
  categories(shoppingId: string): Promise<HomeCategory[]>;
  stories(shoppingId: string): Promise<HomeStory[]>;
  featuredOffers(shoppingId: string): Promise<HomeOffer[]>;
  carousels(shoppingId: string): Promise<HomeCarousel[]>;
}
