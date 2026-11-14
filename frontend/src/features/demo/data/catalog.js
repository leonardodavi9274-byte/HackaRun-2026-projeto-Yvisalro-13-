/**
 * Catálogo de demonstração — TODOS os dados são fictícios.
 * Lojas, produtos, marcas, preços, estoques e distâncias foram inventados para ilustrar as
 * telas do protótipo (docs/imagens/achei). Não representam empresas nem ofertas reais.
 * Os ids das lojas coincidem com as lojas servidas pela API em modo demonstração
 * (backend/src/infrastructure/demo, planta do Shopping Veredas Douradas fictício).
 */
import {STORE_PLACEMENT} from "./store-placement.js";

export const DEMO_MALL = {id: "veredas-douradas", name: "Shopping Veredas Douradas"};

export const CATEGORIES = [
  {id: "moda", label: "Moda"}, {id: "tenis", label: "Tênis"}, {id: "eletronicos", label: "Eletrônicos"},
  {id: "beleza", label: "Beleza"}, {id: "casa", label: "Casa"}, {id: "cafe-doces", label: "Café e doces"},
  {id: "games", label: "Games"}, {id: "livros", label: "Livros"}, {id: "esporte", label: "Esporte"},
];

/**
 * floor/distanceM abaixo são os das telas; na planta em escala real eles são substituídos pelo piso e
 * pela distância de caminhada calculados em store-placement.js (gerado a partir do mapa).
 */
const BASE_STORES = [
  {id: "moda-leve", name: "Moda Leve", initials: "ML", color: "#6c34c9", floor: "Piso 1", distanceM: 80},
  {id: "pixel-house", name: "Pixel House", initials: "PH", color: "#2f4fd8", floor: "Piso 2", distanceM: 120},
  {id: "grao-fino", name: "Grão Fino", initials: "GF", color: "#6b3f22", floor: "Piso 1", distanceM: 30},
  {id: "sport-vibe", name: "Sport Vibe", initials: "SV", color: "#13784a", floor: "Piso 2", distanceM: 210},
  {id: "casa-ninho", name: "Casa Ninho", initials: "CN", color: "#b5520f", floor: "Piso 1", distanceM: 60},
  {id: "megatech", name: "Megatech", initials: "MT", color: "#3a3d48", floor: "Piso 1", distanceM: 340},
  {id: "som-e-cia", name: "Som&Cia", initials: "SC", color: "#b5520f", floor: "Piso 3", distanceM: 410},
  {id: "brilho-beleza", name: "Brilho Beleza", initials: "BB", color: "#b83280", floor: "Piso 2", distanceM: 180},
  {id: "flor-de-pele", name: "Flor de Pele", initials: "FP", color: "#c0567a", floor: "Piso 3", distanceM: 380},
  {id: "arena-games", name: "Arena Games", initials: "AG", color: "#1f2a44", floor: "Piso 2", distanceM: 150},
  {id: "pagina-viva", name: "Página Viva", initials: "PV", color: "#0f5c66", floor: "Piso 1", distanceM: 95},
  {id: "estante-azul", name: "Estante Azul", initials: "EA", color: "#28609b", floor: "Piso 3", distanceM: 360},
  {id: "doce-aurora", name: "Doce Aurora", initials: "DA", color: "#a8462e", floor: "Piso 1", distanceM: 110},
  {id: "corre-tenis", name: "Corre Tênis", initials: "CT", color: "#2d6a4f", floor: "Piso 2", distanceM: 230},
  {id: "passo-firme", name: "Passo Firme", initials: "PF", color: "#5b4636", floor: "Piso 1", distanceM: 70},
  {id: "trilha-esporte", name: "Trilha Esporte", initials: "TE", color: "#3f6212", floor: "Piso 3", distanceM: 395},
  {id: "ponto-esporte", name: "Ponto Esporte", initials: "PE", color: "#166534", floor: "Piso 2", distanceM: 200},
  {id: "vento-moda", name: "Vento Moda", initials: "VM", color: "#7c3aed", floor: "Piso 2", distanceM: 190},
  {id: "lar-sereno", name: "Lar Sereno", initials: "LS", color: "#92400e", floor: "Piso 3", distanceM: 370},
  {id: "lumen-tech", name: "Lumen Tech", initials: "LT", color: "#334155", floor: "Piso 3", distanceM: 350},
];

export const STORES = BASE_STORES.map(s => ({...s, ...(STORE_PLACEMENT[s.id] ? {floor: STORE_PLACEMENT[s.id].floor, distanceM: STORE_PLACEMENT[s.id].distanceM} : {})}));

/**
 * glyph: desenho do produto (ProductGlyph). tint/ink: cores do cartão.
 * terms: palavras pelas quais o produto é encontrado na busca; type: variante exibida como filtro.
 * offers: preço por loja em centavos; previousCents marca promoção; stock 0 = sem estoque.
 */
export const PRODUCTS = [
  {id: "fone-orbit-x", name: "Fone Orbit X", categoryId: "eletronicos", group: "fones", glyph: "headphones", tint: "#e6e9fb", ink: "#2f4fd8",
    type: "over-ear", terms: ["fone", "fones", "headphone", "bluetooth", "sem fio", "over-ear", "orbit"],
    offers: [{storeId: "pixel-house", priceCents: 22900, previousCents: 29900, stock: 14},
      {storeId: "megatech", priceCents: 25900, previousCents: 29900, stock: 2},
      {storeId: "som-e-cia", priceCents: 28900, previousCents: null, stock: 6}]},
  {id: "fone-pulse-air", name: "Fone Pulse Air", categoryId: "eletronicos", group: "fones", glyph: "headphones", tint: "#fbeee6", ink: "#b5520f",
    type: "over-ear", terms: ["fone", "fones", "bluetooth", "sem fio", "over-ear", "pulse"],
    offers: [{storeId: "som-e-cia", priceCents: 18900, previousCents: null, stock: 9}]},
  {id: "fone-orbit-x-pro", name: "Fone Orbit X Pro", categoryId: "eletronicos", group: "fones", glyph: "headphones", tint: "#efeeec", ink: "#9a9893",
    type: "over-ear", terms: ["fone", "fones", "bluetooth", "sem fio", "over-ear", "orbit", "pro"],
    offers: [{storeId: "pixel-house", priceCents: 28900, previousCents: null, stock: 0}]},
  {id: "fone-gota-mini", name: "Fone Gota Mini", categoryId: "eletronicos", group: "fones", glyph: "earbuds", tint: "#e7f2ef", ink: "#0f5c66",
    type: "in-ear", terms: ["fone", "fones", "bluetooth", "sem fio", "in-ear", "gota"],
    offers: [{storeId: "lumen-tech", priceCents: 14900, previousCents: 17900, stock: 11},
      {storeId: "megatech", priceCents: 15900, previousCents: null, stock: 4}]},
  {id: "caixa-som-tom", name: "Caixa de som Tom 20", categoryId: "eletronicos", group: "som", glyph: "speaker", tint: "#ece9f6", ink: "#3a3d48",
    terms: ["caixa", "som", "caixa de som", "bluetooth", "sem fio", "speaker"],
    offers: [{storeId: "som-e-cia", priceCents: 34900, previousCents: null, stock: 5}]},
  {id: "carregador-raio-30", name: "Carregador Raio 30 W", categoryId: "eletronicos", group: "acessorios", glyph: "plug", tint: "#f1f0ec", ink: "#334155",
    terms: ["carregador", "tomada", "usb", "celular"],
    offers: [{storeId: "lumen-tech", priceCents: 8900, previousCents: null, stock: 20},
      {storeId: "megatech", priceCents: 9900, previousCents: null, stock: 3}]},

  {id: "tenis-run-leve", name: "Tênis Run Leve", categoryId: "tenis", group: "tenis", glyph: "shoe", tint: "#e6f1ea", ink: "#13784a",
    type: "corrida", terms: ["tenis", "tênis", "corrida", "run", "running"],
    offers: [{storeId: "sport-vibe", priceCents: 27900, previousCents: 31900, stock: 7},
      {storeId: "corre-tenis", priceCents: 29900, previousCents: null, stock: 5}]},
  {id: "tenis-trilha-serra", name: "Tênis Trilha Serra", categoryId: "tenis", group: "tenis", glyph: "shoe", tint: "#eef0e4", ink: "#3f6212",
    type: "trilha", terms: ["tenis", "tênis", "trilha", "outdoor"],
    offers: [{storeId: "trilha-esporte", priceCents: 38900, previousCents: null, stock: 3}]},
  {id: "tenis-brisa-casual", name: "Tênis Brisa Casual", categoryId: "tenis", group: "tenis", glyph: "shoe", tint: "#f2ece6", ink: "#5b4636",
    type: "casual", terms: ["tenis", "tênis", "casual", "brisa"],
    offers: [{storeId: "passo-firme", priceCents: 19900, previousCents: 23900, stock: 8},
      {storeId: "corre-tenis", priceCents: 21900, previousCents: null, stock: 2}]},

  {id: "jaqueta-corta-vento", name: "Jaqueta corta-vento", categoryId: "moda", group: "jaquetas", glyph: "shirt", tint: "#ece6fb", ink: "#6c34c9",
    terms: ["jaqueta", "corta-vento", "corta vento", "casaco", "moda"],
    offers: [{storeId: "moda-leve", priceCents: 13900, previousCents: 19900, stock: 12}]},
  {id: "camiseta-linho-areia", name: "Camiseta linho areia", categoryId: "moda", group: "camisetas", glyph: "shirt", tint: "#f4efe6", ink: "#8a6d3b",
    terms: ["camiseta", "camisa", "linho", "moda"],
    offers: [{storeId: "vento-moda", priceCents: 5900, previousCents: null, stock: 25},
      {storeId: "moda-leve", priceCents: 6900, previousCents: null, stock: 10}]},
  {id: "mochila-urbana-trama", name: "Mochila urbana Trama", categoryId: "moda", group: "bolsas", glyph: "bag", tint: "#ebe9f7", ink: "#7c3aed",
    terms: ["mochila", "bolsa", "trama"],
    offers: [{storeId: "vento-moda", priceCents: 17900, previousCents: 21900, stock: 6},
      {storeId: "moda-leve", priceCents: 18900, previousCents: null, stock: 4}]},

  {id: "cafeteira-moka", name: "Cafeteira Moka", categoryId: "casa", group: "cafeteiras", glyph: "pot", tint: "#f2ebe6", ink: "#6b3f22",
    terms: ["cafeteira", "moka", "café", "cafe", "cozinha"],
    offers: [{storeId: "casa-ninho", priceCents: 11900, previousCents: null, stock: 9},
      {storeId: "lar-sereno", priceCents: 12900, previousCents: null, stock: 4}]},
  {id: "caneca-termica-ninho", name: "Caneca térmica 350 ml", categoryId: "casa", group: "canecas", glyph: "cup", tint: "#fbeee6", ink: "#b5520f",
    terms: ["caneca", "térmica", "termica", "copo", "café", "cafe"],
    offers: [{storeId: "casa-ninho", priceCents: 4900, previousCents: 5900, stock: 18}]},

  {id: "combo-cafe-pao-de-queijo", name: "Café + pão de queijo", categoryId: "cafe-doces", group: "lanches", glyph: "cup", tint: "#f2ebe6", ink: "#6b3f22",
    terms: ["café", "cafe", "pão de queijo", "pao de queijo", "lanche", "combo"],
    offers: [{storeId: "grao-fino", priceCents: 1290, previousCents: 1520, stock: 30}]},
  {id: "cafe-especial-250", name: "Café especial 250 g", categoryId: "cafe-doces", group: "cafes", glyph: "beans", tint: "#efe7df", ink: "#6b3f22",
    terms: ["café", "cafe", "grão", "grao", "especial"],
    offers: [{storeId: "grao-fino", priceCents: 3900, previousCents: null, stock: 15}]},
  {id: "caixa-brigadeiros", name: "Caixa com 12 brigadeiros", categoryId: "cafe-doces", group: "doces", glyph: "gift", tint: "#f8e9e4", ink: "#a8462e",
    terms: ["brigadeiro", "doce", "doces", "presente", "chocolate"],
    offers: [{storeId: "doce-aurora", priceCents: 2400, previousCents: null, stock: 10}]},

  {id: "serum-vitamina-c", name: "Sérum vitamina C 30 ml", categoryId: "beleza", group: "skincare", glyph: "bottle", tint: "#f8e8ef", ink: "#b83280",
    terms: ["sérum", "serum", "skincare", "pele", "vitamina c", "beleza"],
    offers: [{storeId: "brilho-beleza", priceCents: 8900, previousCents: 10900, stock: 6},
      {storeId: "flor-de-pele", priceCents: 9500, previousCents: null, stock: 8}]},
  {id: "protetor-solar-50", name: "Protetor solar FPS 50", categoryId: "beleza", group: "skincare", glyph: "bottle", tint: "#fbf3df", ink: "#a16207",
    terms: ["protetor", "solar", "fps", "skincare", "pele", "beleza"],
    offers: [{storeId: "flor-de-pele", priceCents: 5900, previousCents: null, stock: 12}]},

  {id: "controle-astro", name: "Controle sem fio Astro", categoryId: "games", group: "controles", glyph: "gamepad", tint: "#e6e9f2", ink: "#1f2a44",
    terms: ["controle", "joystick", "games", "sem fio", "bluetooth", "astro"],
    offers: [{storeId: "arena-games", priceCents: 24900, previousCents: 27900, stock: 4}]},
  {id: "jogo-corrida-neon", name: "Jogo Corrida Neon", categoryId: "games", group: "jogos", glyph: "gamepad", tint: "#efe6fb", ink: "#6c34c9",
    terms: ["jogo", "game", "games", "corrida"],
    offers: [{storeId: "arena-games", priceCents: 19900, previousCents: null, stock: 7}]},

  {id: "livro-mapas-do-cotidiano", name: "Livro Mapas do Cotidiano", categoryId: "livros", group: "livros", glyph: "book", tint: "#e4f0f1", ink: "#0f5c66",
    terms: ["livro", "livros", "leitura", "mapas"],
    offers: [{storeId: "estante-azul", priceCents: 4900, previousCents: null, stock: 5},
      {storeId: "pagina-viva", priceCents: 5400, previousCents: null, stock: 3}]},

  {id: "bola-futsal-giro", name: "Bola de futsal Giro", categoryId: "esporte", group: "bolas", glyph: "ball", tint: "#e6f1ea", ink: "#166534",
    terms: ["bola", "futsal", "futebol", "esporte"],
    offers: [{storeId: "ponto-esporte", priceCents: 11900, previousCents: null, stock: 9}]},
  {id: "garrafa-squeeze-1l", name: "Garrafa squeeze 1 L", categoryId: "esporte", group: "acessorios", glyph: "bottle", tint: "#eef0e4", ink: "#3f6212",
    terms: ["garrafa", "squeeze", "água", "agua", "esporte", "academia"],
    offers: [{storeId: "trilha-esporte", priceCents: 3900, previousCents: 4900, stock: 14},
      {storeId: "sport-vibe", priceCents: 4500, previousCents: null, stock: 6}]},
];

/** Stories (tela 07): ofertas destacadas por loja; postedHoursAgo e validade são fictícios. */
export const STORIES = [
  {id: "story-moda-1", storeId: "moda-leve", productId: "camiseta-linho-areia", headline: "Linho para o calor", postedHoursAgo: 3, validity: "Coleção nova da semana"},
  {id: "story-moda-2", storeId: "moda-leve", productId: "jaqueta-corta-vento", badge: "SÓ HOJE", postedHoursAgo: 2, validity: "Válido até domingo ou enquanto durar o estoque"},
  {id: "story-moda-3", storeId: "moda-leve", productId: "mochila-urbana-trama", postedHoursAgo: 1, validity: "Peça vista também na Vento Moda"},
  {id: "story-pixel-1", storeId: "pixel-house", productId: "fone-orbit-x", badge: "RELÂMPAGO", postedHoursAgo: 1, validity: "Válido enquanto durar o estoque"},
  {id: "story-grao-1", storeId: "grao-fino", productId: "combo-cafe-pao-de-queijo", badge: "ATÉ 16H", postedHoursAgo: 2, validity: "Válido hoje, no balcão"},
  {id: "story-sport-1", storeId: "sport-vibe", productId: "tenis-run-leve", postedHoursAgo: 5, validity: "Numerações do 36 ao 44"},
  {id: "story-casa-1", storeId: "casa-ninho", productId: "caneca-termica-ninho", postedHoursAgo: 4, validity: "Cores sortidas"},
  {id: "story-brilho-1", storeId: "brilho-beleza", productId: "serum-vitamina-c", postedHoursAgo: 6, validity: "Válido até sábado"},
];

/** Estado inicial da conta de demonstração (pessoa fictícia). */
export const DEMO_ACCOUNT = {
  name: "Marina Souza",
  email: "marina.souza@exemplo.com",
  password: "demo-aurora-26",
  categoryIds: ["moda", "tenis", "eletronicos", "cafe-doces"],
  productInterests: ["Fone bluetooth", "Tênis de corrida", "Cafeteira"],
  marketing: false,
  /** savedCents: menor preço quando o item foi salvo (fictício), para calcular a queda. */
  wishes: [
    {productId: "fone-orbit-x", savedCents: 29900},
    {productId: "tenis-run-leve", savedCents: 31900},
    {productId: "jaqueta-corta-vento", savedCents: 19900},
    {productId: "cafeteira-moka", savedCents: 11900},
    {productId: "serum-vitamina-c", savedCents: 8900},
    {productId: "livro-mapas-do-cotidiano", savedCents: 4900},
  ],
  alerts: [
    {productId: "fone-orbit-x-pro", kind: "restock"},
    {productId: "controle-astro", kind: "price", targetCents: 19900},
  ],
  recentSearches: ["fone bluetooth até 300", "tênis de corrida", "café"],
};

const storeIndex = new Map(STORES.map(s => [s.id, s]));
const productIndex = new Map(PRODUCTS.map(p => [p.id, p]));
export const storeById = id => storeIndex.get(id) ?? null;
export const productById = id => productIndex.get(id) ?? null;
export const categoryLabel = id => CATEGORIES.find(c => c.id === id)?.label ?? id;
