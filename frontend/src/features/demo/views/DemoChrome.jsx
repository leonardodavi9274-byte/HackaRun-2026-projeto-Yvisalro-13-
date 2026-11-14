import {BottomNav} from "../../../shared/components/BottomNav.jsx";
import {Icon} from "../../../shared/components/Icon.jsx";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";

export function DemoNotice({compact = false}) {
  return <p className={"demo-notice" + (compact ? " is-compact" : "")}>
    <strong>Modo demonstração</strong>{compact ? " · dados fictícios" : " · Lojas, produtos, preços e contas são fictícios e ficam só neste navegador."}
  </p>;
}

/** Página do app em coluna de celular, com a barra inferior das cinco abas. */
export function DemoPage({current, className = "", children}) {
  return <div className={"demo-page " + className}>
    <main className="demo-main">{children}</main>
    <BottomNav current={current} />
  </div>;
}

export function WishButton({productId, label, className = "demo-heart"}) {
  const store = useDemoStore(), active = store.isWished(productId);
  return <button type="button" className={className} aria-pressed={active}
    aria-label={active ? `Remover ${label} dos desejos` : `Salvar ${label} nos desejos`} onClick={() => store.toggleWish(productId)}>
    <Icon name="heart" size={22} fill={active ? "currentColor" : "none"} />
  </button>;
}
