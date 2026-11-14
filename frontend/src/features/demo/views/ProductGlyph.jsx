/** Desenhos sólidos de produto, no estilo das telas do protótipo (sem fotos ou marcas reais). */
const glyphs = {
  headphones: <path d="M4 15v-3a8 8 0 0 1 16 0v3h-3.5v-3a4.5 4.5 0 0 0-9 0v3H4Zm0 1h3.5v5H4zm12.5 0H20v5h-3.5z" />,
  earbuds: <path d="M7 4a3 3 0 0 1 3 3v5H8v8H6v-8.3A3 3 0 0 1 7 4Zm10 0a3 3 0 0 0-3 3v5h2v8h2v-8.3A3 3 0 0 0 17 4Z" />,
  speaker: <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm5 8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />,
  plug: <path d="M8 2h2v5h4V2h2v5h2v5a6 6 0 0 1-5 5.9V22h-2v-4.1A6 6 0 0 1 6 12V7h2V2Z" />,
  shoe: <path d="M2 15.5c3 0 5-3.5 5.5-6l5 3 9 2.5v4H2v-3.5Zm0 4.5h19.5v1.5H2z" />,
  shirt: <path d="M8.5 3 3 6l2.5 5 2-1v11h9V10l2 1L21 6l-5.5-3c-.5 2-1.7 3-3.5 3S9 5 8.5 3Z" />,
  bag: <path d="M6 7h12l1.5 14h-15L6 7Zm3 0V5.5a3 3 0 0 1 6 0V7h-1.6V5.5a1.4 1.4 0 0 0-2.8 0V7H9Z" />,
  pot: <path d="M8 2h8l-1 4h2.5l-1 3H17l2 13H5L7 9h.5l-1-3H9L8 2Zm11 9h2v6h-2z" />,
  cup: <path d="M4 7h13v7a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V7Zm13 2h1.5a3.5 3.5 0 0 1 0 7H16.6l.3-2h1.6a1.5 1.5 0 0 0 0-3H17V9Z" />,
  beans: <path d="M9 3c3 0 5 3.5 5 8s-2 8-5 8-5-3.5-5-8 2-8 5-8Zm6.5 4c2.5 0 4.5 2.7 4.5 6.5S18 21 15.5 21c-.8 0-1.5-.3-2.1-.8C15 18.6 16 15.6 16 12s-.4-3.5-.5-5Z" />,
  gift: <path d="M3 8h18v4H3zm1 5h7v8H4zm9 0h7v8h-7zM11 8h2v4h-2zM12 7c-1-3-5-4-5-1.5S11 7 12 7Zm0 0c1-3 5-4 5-1.5S13 7 12 7Z" />,
  bottle: <path d="M9.5 2h5v4h-5zm-1 5h7l1 2v12a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V9l1-2Z" />,
  gamepad: <path d="M7 7h10c3.5 0 5.5 11 2 12.5l-4-3.5H9l-4 3.5C1.5 18 3.5 7 7 7Zm.5 3v2h-2v1.5h2v2H9v-2h2V12H9v-2H7.5ZM16 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />,
  book: <path d="M3 5c3-1.5 6-1 8.2 1v15C9 19 6 18.5 3 20V5Zm18 0c-3-1.5-6-1-8.2 1v15c2.2-2 5.2-2.5 8.2-1V5Z" />,
  ball: <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 5-3.8 2.8 1.4 4.5h4.8l1.4-4.5L12 7Z" />,
};

export function ProductGlyph({glyph, color = "currentColor", size = 40}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">{glyphs[glyph] ?? glyphs.bag}</svg>;
}

/** Quadrado colorido com o desenho do produto e, opcionalmente, o selo de desconto. */
export function ProductTile({product, discount, size = 88, glyphSize, muted = false}) {
  return <span className="demo-tile" style={{width: size, height: size, background: muted ? "#efeeec" : product.tint}}>
    {discount > 0 && <span className="demo-badge">-{discount}%</span>}
    <ProductGlyph glyph={product.glyph} color={muted ? "#a3a19b" : product.ink} size={glyphSize ?? Math.round(size * 0.42)} />
  </span>;
}

export function StoreBadge({store, size = 24}) {
  return <span className="demo-store-badge" style={{background: store.color, width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.44))}} aria-hidden="true">{store.initials}</span>;
}

export function Initials({name, size = 56, photo}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
  return photo
    ? <img className="demo-avatar" src={photo} alt="" width={size} height={size} />
    : <span className="demo-avatar" style={{width: size, height: size, fontSize: Math.round(size * 0.36)}} aria-hidden="true">{initials}</span>;
}
