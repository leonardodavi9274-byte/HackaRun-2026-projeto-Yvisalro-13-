import { Icon } from "../../../shared/components/Icon.jsx";
import { useSystemStatusViewModel } from "../viewmodels/useSystemStatusViewModel.js";

const steps = [
  {
    number: "01",
    icon: "search",
    title: "Descubra",
    description: "Produtos e ofertas das lojas, reunidos em um só lugar.",
  },
  {
    number: "02",
    icon: "heart",
    title: "Compare",
    description:
      "Mais clareza para escolher a oferta que faz sentido para você.",
  },
  {
    number: "03",
    icon: "pin",
    title: "Encontre",
    description: "Saiba em qual loja procurar e visualize um trajeto simulado.",
  },
];

export function ProjectHomeView() {
  const { status, data, error, retry } = useSystemStatusViewModel();
  const connectionLabel =
    status === "loading"
      ? "Conectando ao serviço…"
      : status === "ready"
        ? "Serviço conectado"
        : "Serviço indisponível";

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <div className="app-shell">
        <header className="site-header">
          <a className="brand" href="/" aria-label="Hackarum-Yvisalro, início">
            <span className="brand-mark">
              <Icon name="bag" />
            </span>
            <span>
              Hackarum<span className="brand-subtitle">Yvisalro</span>
            </span>
          </a>
          <span className="project-stage">
            <span className="stage-dot" /> Projeto em desenvolvimento
          </span>
        </header>
        <main id="conteudo">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="eyebrow">
                <span /> Seu shopping, mais perto
              </span>
              <h1 id="hero-title">
                Boas descobertas.
                <br />
                <span>Melhores escolhas.</span>
              </h1>
              <p className="hero-description">
                Encontre produtos, compare ofertas e descubra o caminho até a
                loja. Sua próxima descoberta começa aqui.
              </p>
              <a className="primary-link" href="#proposta">
                Conheça a proposta <Icon name="arrow" size={20} />
              </a>
              <p className="hero-note">
                Uma vitrine para descobrir. Compras e pagamentos acontecem fora
                do aplicativo.
              </p>
            </div>
            <div className="discovery-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="art-caption">
                Um lugar. Muitas possibilidades.
              </div>
              <div className="shop-card shop-card-back">
                <span className="shop-icon">
                  <Icon name="pin" size={26} />
                </span>
                <div>
                  <strong>O caminho até lá</strong>
                  <span>Trajetos simulados</span>
                </div>
              </div>
              <div className="shop-card shop-card-main">
                <div className="art-product">
                  <Icon name="bag" size={82} />
                  <span className="spark spark-one">✦</span>
                  <span className="spark spark-two">✦</span>
                </div>
                <div className="art-product-info">
                  <span>Novas descobertas</span>
                  <strong>Sua próxima escolha</strong>
                  <div>
                    <span className="art-tag">Explore possibilidades</span>
                    <Icon name="heart" size={21} />
                  </div>
                </div>
              </div>
              <div className="floating-label">
                <span>
                  <Icon name="check" size={17} />
                </span>{" "}
                Tudo começa com uma descoberta
              </div>
              <span className="art-footnote">
                Ilustração da proposta · sem ofertas reais
              </span>
            </div>
          </section>
          <section
            className="proposal"
            id="proposta"
            aria-labelledby="proposal-title"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">A experiência planejada</span>
                <h2 id="proposal-title">Da busca à loja.</h2>
              </div>
              <p>
                Menos tempo procurando.
                <br />
                Mais possibilidades para escolher.
              </p>
            </div>
            <div className="steps-grid">
              {steps.map((step) => (
                <article className="step-card" key={step.number}>
                  <div className="step-top">
                    <span className="step-icon">
                      <Icon name={step.icon} />
                    </span>
                    <span className="step-number">{step.number}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="planned-label">
                    Funcionalidade planejada
                  </span>
                </article>
              ))}
            </div>
          </section>
          <section
            className="development-note"
            aria-labelledby="development-title"
          >
            <div>
              <span className="eyebrow">Primeiro passo</span>
              <h2 id="development-title">
                Estamos construindo essa experiência.
              </h2>
              <p>
                A estrutura inicial está pronta para evoluir. Catálogo, contas e
                mapa ainda serão implementados a partir das telas do protótipo.
              </p>
            </div>
            <div
              className={`connection-state connection-${status}`}
              role="status"
              aria-live="polite"
            >
              <span className="connection-dot" />
              <strong>{connectionLabel}</strong>
              {status === "loading" && <p>Aguarde um instante.</p>}
              {status === "ready" && (
                <p>
                  {data.databaseConfigured
                    ? "Configuração do banco disponível. Conexão ainda não verificada."
                    : "Banco de dados aguardando configuração."}
                </p>
              )}
              {status === "error" && (
                <>
                  <p>{error}</p>
                  <button type="button" onClick={retry}>
                    Tentar novamente <Icon name="arrow" size={16} />
                  </button>
                </>
              )}
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <span>Hackarum-Yvisalro</span>
          <span>Descoberta de produtos, lojas e promoções.</span>
          <span>Base inicial · 2026</span>
        </footer>
      </div>
    </>
  );
}
