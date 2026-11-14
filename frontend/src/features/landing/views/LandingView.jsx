import {AppLink} from "../../../app/Link.jsx";
import {Icon} from "../../../shared/components/Icon.jsx";
import "../../../styles/landing.css";

const STEPS = [
  {n: "01", icon: "search", title: "Busque", text: "Escreva do seu jeito — “fone bluetooth até 300”. A gente entende o produto e o preço máximo.", shot: "busca", alt: "Resultados da busca por fone bluetooth até 300 reais, com preços, lojas, distância e estoque"},
  {n: "02", icon: "pulse", title: "Compare", text: "Veja o mesmo produto em várias lojas, quem está em promoção, quem tem estoque e quanto você economiza.", shot: "desejos", alt: "Lista de desejos mostrando quedas de preço e a loja mais barata de cada item"},
  {n: "03", icon: "navigate", title: "Chegue lá", text: "Escolha a loja e siga a rota dentro do shopping, passo a passo, com o piso e a distância.", shot: "rota", alt: "Mapa do shopping com a rota até a loja e a instrução em 10 metros vire à direita"},
];

const FEATURES = [
  {icon: "bag", title: "Stories das lojas", text: "Promoções do dia em formato de story, com preço, validade e um toque para ir até a loja."},
  {icon: "heart", title: "Lista de desejos", text: "Salve produtos e saiba quando o preço cair — e em qual loja está mais barato."},
  {icon: "bell", title: "Avise-me", text: "Produto esgotado? Peça um aviso quando voltar ao estoque ou chegar ao preço que você quer."},
  {icon: "pin", title: "Ofertas por perto", text: "Passou perto de uma loja com promoção do seu interesse? A oferta aparece na hora."},
  {icon: "ads-off", title: "Sem interrupção na rota", text: "Enquanto você segue um trajeto, nenhum anúncio aparece na tela."},
  {icon: "user", title: "Do seu jeito", text: "Escolha categorias e produtos de interesse para montar sua tela inicial. E-mails só se você quiser."},
];

const MERCHANT = [
  {title: "Sua vitrine na busca", text: "Produtos, preços e estoque da sua loja aparecem quando o cliente procura — lado a lado com a concorrência."},
  {title: "Promoções que chegam", text: "Publique ofertas em stories e alcance quem está por perto e quem marcou interesse na categoria."},
  {title: "O cliente chega na porta", text: "Cada oferta leva a uma rota até a sua loja, com piso e distância."},
  {title: "Só os seus dados", text: "Cada empresa administra apenas os próprios produtos, preços e promoções."},
];

const FAQ = [
  {q: "Preciso comprar pelo app?", a: "Não. O Hackarum ajuda a encontrar o produto, comparar e chegar à loja. Compras e pagamentos acontecem na loja; você pode sair sem comprar."},
  {q: "Funciona com a minha localização?", a: "A rota parte de um ponto conhecido do shopping que você escolhe, como uma entrada. A localização do aparelho só serve para saber se você está no shopping e não é salva."},
  {q: "Vou receber propaganda por e-mail?", a: "Só se você ativar. A opção começa desligada e pode ser mudada a qualquer momento no Perfil."},
  {q: "As lojas e os preços da demonstração são reais?", a: "Não. Shopping, lojas, produtos, preços, estoques e contas da demonstração são fictícios."},
];

function Phone({shot, alt, className = ""}) {
  return <figure className={"lp-phone " + className}>
    <img src={`/landing/${shot}.webp`} alt={alt} width="320" height="693" loading="lazy" decoding="async" />
  </figure>;
}

/** Landing page do Hackarum-Yvisalro (tecnologia sorteada): consumidores e lojistas. */
export function LandingView() {
  return <div className="lp">
    <a className="skip-link" href="#lp-conteudo">Ir para o conteúdo</a>
    <header className="lp-header">
      <a className="lp-brand" href="#lp-topo" aria-label="Hackarum, início da página"><span className="lp-brand-mark"><Icon name="bag" size={20} /></span>hackarum</a>
      <nav aria-label="Seções da página" className="lp-nav">
        <a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#lojistas">Para lojistas</a><a href="#perguntas">Perguntas</a>
      </nav>
      <AppLink to="/entrar" className="lp-button is-small">Entrar</AppLink>
    </header>

    <main id="lp-conteudo">
      <section className="lp-hero" id="lp-topo" aria-labelledby="lp-hero-title">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow"><span />Seu shopping, mais perto</p>
          <h1 id="lp-hero-title">Encontre o produto, o melhor preço e o <em>caminho até a loja</em>.</h1>
          <p className="lp-lead">Busque, compare ofertas entre as lojas do shopping e siga a rota até a porta. Tudo em um só app, sem precisar rodar o shopping inteiro.</p>
          <div className="lp-actions">
            <AppLink to="/entrar" className="lp-button">Ver demonstração <Icon name="arrow" size={18} /></AppLink>
            <a href="#lojistas" className="lp-button is-ghost">Sou lojista</a>
          </div>
          <ul className="lp-proof" aria-label="Destaques">
            <li><strong>11</strong> telas funcionando</li><li><strong>150+</strong> lojas no mapa</li><li><strong>0</strong> anúncios durante a rota</li>
          </ul>
        </div>
        <div className="lp-hero-art" aria-hidden="false">
          <Phone shot="inicio" alt="Tela inicial com busca, stories das lojas, sugestões e um destaque de queda de preço" className="is-main" />
          <Phone shot="oferta" alt="Oferta próxima: café com pão de queijo por 12,90 reais a 84 metros" className="is-back" />
          <p className="lp-float is-price" aria-hidden="true"><span className="lp-tag">-30%</span> Jaqueta baixou pra <strong>R$ 139</strong></p>
          <p className="lp-float is-route" aria-hidden="true"><Icon name="navigate" size={16} /> Pixel House · 4 min</p>
        </div>
      </section>

      <section className="lp-section" id="como-funciona" aria-labelledby="lp-steps-title">
        <div className="lp-section-head"><p className="lp-eyebrow"><span />Como funciona</p><h2 id="lp-steps-title">Três passos entre a vontade e a loja certa</h2></div>
        <ol className="lp-steps">
          {STEPS.map(s => <li key={s.n} className="lp-step">
            <Phone shot={s.shot} alt={s.alt} />
            <div><span className="lp-step-n">{s.n}</span><h3><Icon name={s.icon} size={22} />{s.title}</h3><p>{s.text}</p></div>
          </li>)}
        </ol>
      </section>

      <section className="lp-section is-tinted" id="recursos" aria-labelledby="lp-features-title">
        <div className="lp-section-head"><p className="lp-eyebrow"><span />Recursos</p><h2 id="lp-features-title">Feito para quem quer resolver rápido</h2></div>
        <ul className="lp-features">
          {FEATURES.map(f => <li key={f.title}><span className="lp-feature-icon"><Icon name={f.icon} size={24} /></span><h3>{f.title}</h3><p>{f.text}</p></li>)}
        </ul>
        <div className="lp-gallery" aria-label="Mais telas do app">
          <Phone shot="story" alt="Story promocional da Moda Leve: jaqueta corta-vento por 139 reais, 30% de desconto" />
          <Phone shot="login" alt="Tela de login com a conta lembrada" />
          <Phone shot="desejos" alt="Tela de desejos com abas Desejos e Avise-me" />
        </div>
      </section>

      <section className="lp-merchant" id="lojistas" aria-labelledby="lp-merchant-title">
        <div className="lp-merchant-inner">
          <div className="lp-section-head is-light"><p className="lp-eyebrow"><span />Para lojistas</p>
            <h2 id="lp-merchant-title">Ajude os clientes a encontrar os produtos da sua loja</h2>
            <p>Sua vitrine dentro do shopping: catálogo, promoções e o caminho até a sua porta.</p></div>
          <ul className="lp-merchant-list">
            {MERCHANT.map((m, i) => <li key={m.title}><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{m.title}</h3><p>{m.text}</p></div></li>)}
          </ul>
          <div className="lp-merchant-cta">
            <p><strong>Painel da empresa em desenvolvimento.</strong> O cadastro de lojas ainda não está aberto nesta versão.</p>
            <a href="#perguntas" className="lp-button is-light">Saiba mais</a>
          </div>
        </div>
      </section>

      <section className="lp-section" id="perguntas" aria-labelledby="lp-faq-title">
        <div className="lp-section-head"><p className="lp-eyebrow"><span />Perguntas</p><h2 id="lp-faq-title">Antes de você começar</h2></div>
        <div className="lp-faq">{FAQ.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      </section>

      <section className="lp-final" aria-labelledby="lp-final-title">
        <h2 id="lp-final-title">Seu próximo achado está a poucos passos.</h2>
        <p>Experimente a demonstração com uma conta pronta — leva menos de um minuto.</p>
        <AppLink to="/entrar" className="lp-button">Ver demonstração <Icon name="arrow" size={18} /></AppLink>
      </section>
    </main>

    <footer className="lp-footer">
      <span className="lp-brand"><span className="lp-brand-mark"><Icon name="bag" size={18} /></span>hackarum</span>
      <p>Hackarum-Yvisalro · HackaRun 2026 · Tema 03: descoberta de produtos, lojas e promoções.</p>
      <p>Shopping, lojas, produtos e preços exibidos são fictícios.</p>
    </footer>
  </div>;
}
