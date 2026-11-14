import type {HomeContentRepository} from "../ports/home-content-repository.ts";
import type {HomeResponse,HomeSection} from "../../domain/home/home-content.ts";
import {ApiError} from "../../presentation/http/errors/api-error.ts";

const unavailable = () => new ApiError(503, "HOME_UNAVAILABLE", "Não foi possível carregar a tela inicial.");
const empty = <T>(): HomeSection<T> => ({status: "empty", items: []});

function section<T>(name: string, result: PromiseSettledResult<T[]>): HomeSection<T> {
  if (result.status === "fulfilled") return {status: result.value.length ? "ready" : "empty", items: result.value};
  // Sem detalhes do banco no log nem na resposta.
  console.error(JSON.stringify({code: "HOME_SECTION_UNAVAILABLE", section: name, stage: "home"}));
  return {status: "unavailable", items: []};
}

export class HomeContentService {
  readonly repo: HomeContentRepository;
  constructor(repo: HomeContentRepository) {this.repo = repo;}

  async get(): Promise<HomeResponse> {
    const generatedAt = new Date().toISOString();
    const shopping = await this.repo.defaultShopping().catch(() => {throw unavailable();});
    // Sem shopping padrão publicado: consulta concluída, nenhum conteúdo vigente.
    if (!shopping) return {generatedAt, shopping: null, sections: {categories: empty(), stories: empty(), featuredOffers: empty(), carousels: empty()}};
    const [categories, stories, featuredOffers, carousels] = await Promise.allSettled([
      this.repo.categories(shopping.id), this.repo.stories(shopping.id),
      this.repo.featuredOffers(shopping.id), this.repo.carousels(shopping.id),
    ]);
    const sections = {
      categories: section("categories", categories), stories: section("stories", stories),
      featuredOffers: section("featuredOffers", featuredOffers), carousels: section("carousels", carousels),
    };
    if (Object.values(sections).every(s => s.status === "unavailable")) throw unavailable();
    return {generatedAt, shopping, sections};
  }
}
