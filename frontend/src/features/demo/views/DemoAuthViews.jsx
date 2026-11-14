import {useEffect, useId, useRef, useState} from "react";
import {AppLink} from "../../../app/Link.jsx";
import {navigate} from "../../../app/navigation.js";
import {Icon} from "../../../shared/components/Icon.jsx";
import {FormFeedback} from "../../../shared/components/FormFeedback.jsx";
import {CategoryGrid} from "../../registration/views/CategoryGrid.jsx";
import {CATEGORIES} from "../data/catalog.js";
import {useDemoStore} from "../viewmodels/DemoStore.jsx";
import {DemoNotice} from "./DemoChrome.jsx";
import {Initials} from "./ProductGlyph.jsx";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Rascunho do cadastro só em memória: a senha nunca vai para o armazenamento do navegador. */
let signupDraft = null;

function PasswordInput({id, value, onChange, autoComplete, invalid, describedBy}) {
  const [visible, setVisible] = useState(false);
  return <div className="password-wrap">
    <input id={id} type={visible ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete}
      aria-invalid={invalid || undefined} aria-describedby={describedBy} />
    <button type="button" className="eye-button" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible} onClick={() => setVisible(v => !v)}>
      <Icon name={visible ? "eye-off" : "eye"} size={22} />
    </button>
  </div>;
}

export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return {score, label: ["Senha muito fraca", "Senha fraca", "Senha razoável", "Senha boa", "Senha forte"][score]};
}

function suggestPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(16));
  return Array.from(values, v => chars[v % chars.length]).join("");
}

function BrandMark() {
  return <div className="demo-brand"><span className="demo-brand-mark"><Icon name="bag" size={22} /></span>hackarum</div>;
}

/** Tela 01 — Login. */
export function DemoLoginView() {
  const store = useDemoStore(), remembered = store.lastAccount;
  const [email, setEmail] = useState(remembered?.email ?? ""), [password, setPassword] = useState("");
  const [error, setError] = useState(null), [busy, setBusy] = useState(false);
  const emailId = useId(), passwordId = useId();

  async function submit(event) {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) { setError("Informe um e-mail válido."); return; }
    if (!password) { setError("Informe sua senha."); return; }
    setBusy(true); setError(null);
    try { await store.login(email, password); navigate("/inicio"); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page demo-auth"><div className="auth-shell">
    <BrandMark />
    {remembered ? <div className="demo-welcome">
      <span className="demo-welcome-ring"><Initials name={remembered.name} size={110} photo={remembered.photo} /></span>
      <h1>Que bom te ver de novo</h1>
      <p className="auth-lead">Não é {remembered.name.split(" ")[0]}? <button type="button" className="text-button" onClick={() => { store.forgetLastAccount(); setEmail(""); setPassword(""); }}>Trocar conta</button></p>
    </div> : <div className="demo-welcome"><h1>Entrar</h1><p className="auth-lead">Encontre o produto, o melhor preço e o caminho até a loja.</p></div>}
    <form className="auth-form" onSubmit={submit} noValidate>
      <FormFeedback message={error} />
      <div className="form-field"><label htmlFor={emailId}>E-mail</label>
        <div className="demo-input-icon"><Icon name="mail" size={20} /><input id={emailId} type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></div></div>
      <div className="form-field"><label htmlFor={passwordId}>Senha</label>
        <div className="demo-input-icon"><Icon name="lock" size={20} /><PasswordInput id={passwordId} value={password} onChange={setPassword} autoComplete="current-password" /></div></div>
      {(!remembered || remembered.email === store.demoCredentials.email) && <div className="demo-fill-card">
        <Icon name="key" size={20} /><span>Conta de demonstração disponível neste navegador</span>
        <button type="button" onClick={() => { setEmail(store.demoCredentials.email); setPassword(store.demoCredentials.password); setError(null); }}>Preencher</button>
      </div>}
      <p className="demo-right"><AppLink className="demo-link" to="/recuperar-senha">Esqueci a senha</AppLink></p>
      <div className="auth-actions">
        <button className="primary-button" disabled={busy}>{busy && <span className="spinner" />}Entrar</button>
        <p className="legal-note">Ainda não tem conta? <AppLink to="/cadastro">Criar conta</AppLink></p>
      </div>
    </form>
    <DemoNotice />
  </div></main>;
}

/** Tela 02 — Cadastro, passo 1 de 2. */
export function DemoSignupView() {
  const store = useDemoStore();
  const [form, setForm] = useState(() => signupDraft ?? {name: "", email: "", password: "", photo: null});
  const [errors, setErrors] = useState({}), [legal, setLegal] = useState(false);
  const ids = {name: useId(), email: useId(), password: useId(), strength: useId()};
  const strength = passwordStrength(form.password);
  const set = (key, value) => setForm(f => ({...f, [key]: value}));

  async function onPhoto(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setErrors(e => ({...e, photo: "Use uma imagem JPG, PNG ou WebP."})); return; }
    const bitmap = await createImageBitmap(file), side = Math.min(bitmap.width, bitmap.height), canvas = document.createElement("canvas");
    canvas.width = canvas.height = 160;
    canvas.getContext("2d").drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 160, 160);
    set("photo", canvas.toDataURL("image/webp", 0.8)); setErrors(e => ({...e, photo: null}));
  }

  function submit(event) {
    event.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = "Informe seu nome.";
    if (!EMAIL.test(form.email.trim())) next.email = "Informe um e-mail válido.";
    else if (store.emailExists(form.email)) next.email = "Já existe uma conta de demonstração com esse e-mail. Entre ou use outro e-mail.";
    if (form.password.length < 8) next.password = "Use pelo menos 8 caracteres.";
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(ids[Object.keys(next)[0]])?.focus(); return; }
    signupDraft = form;
    navigate("/cadastro/preferencias");
  }

  return <main className="auth-page"><div className="auth-shell">
    <div className="auth-top"><button type="button" className="back-button" aria-label="Voltar" onClick={() => navigate("/entrar")}><Icon name="back" size={22} /></button><span>Passo 1 de 2</span></div>
    <div className="auth-progress" aria-hidden="true"><span className="active" /><span /></div>
    <h1>Crie sua conta</h1>
    <p className="auth-lead">Encontre o produto, o melhor preço e o caminho até a loja.</p>
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="photo-field">
        <label className="photo-circle file-label">
          {form.photo ? <img src={form.photo} alt="Foto escolhida" /> : <Icon name="camera" size={30} />}
          <span className="photo-add" aria-hidden="true">+</span>
          <input className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => onPhoto(e.target.files?.[0])} />
        </label>
        <div className="photo-copy"><strong>Foto de perfil</strong><small>Opcional — dá pra adicionar depois</small>
          {form.photo && <button type="button" className="text-button" onClick={() => set("photo", null)}>Remover foto</button>}
          {errors.photo && <small className="field-error">{errors.photo}</small>}</div>
      </div>
      <div className="form-field"><label htmlFor={ids.name}>Nome</label>
        <input id={ids.name} autoComplete="name" value={form.name} onChange={e => set("name", e.target.value)} aria-invalid={Boolean(errors.name) || undefined} />
        {errors.name && <span className="field-error">{errors.name}</span>}</div>
      <div className="form-field"><label htmlFor={ids.email}>E-mail de login</label>
        <input id={ids.email} type="email" autoComplete="email" value={form.email} onChange={e => set("email", e.target.value)} aria-invalid={Boolean(errors.email) || undefined} />
        {errors.email && <span className="field-error">{errors.email}</span>}</div>
      <div className="form-field"><label htmlFor={ids.password}>Senha</label>
        <PasswordInput id={ids.password} value={form.password} onChange={v => set("password", v)} autoComplete="new-password" invalid={Boolean(errors.password)} describedBy={ids.strength} />
        <div className="password-meter" aria-hidden="true">{[1, 2, 3, 4].map(i => <span key={i} className={strength.score >= i ? "active" : ""} />)}</div>
        <p id={ids.strength} className="password-caption demo-strength">{form.password ? strength.label : "Use 8 caracteres ou mais"} · <button type="button" className="text-button" onClick={() => set("password", suggestPassword())}>sugerir senha forte</button></p>
        {errors.password && <span className="field-error">{errors.password}</span>}</div>
      <div className="auth-actions">
        <button className="primary-button">Continuar</button>
        <p className="legal-note">Ao continuar você aceita os <button type="button" className="text-button" onClick={() => setLegal(true)}>Termos</button> e a <button type="button" className="text-button" onClick={() => setLegal(true)}>Política de privacidade</button>.</p>
        {legal && <p className="form-feedback info" role="status">Modo demonstração: Termos e Política de privacidade ainda serão publicados pela equipe. Nenhum dado sai deste navegador.</p>}
      </div>
    </form>
  </div></main>;
}

/** Tela 03 — Preferências, passo 2 de 2. */
export function DemoPreferencesView() {
  const store = useDemoStore();
  const [categoryIds, setCategoryIds] = useState([]), [terms, setTerms] = useState([]), [term, setTerm] = useState("");
  const [marketing, setMarketing] = useState(false), [busy, setBusy] = useState(false);
  const termId = useId();
  useEffect(() => { if (!signupDraft) navigate("/cadastro", {replace: true}); }, []);
  if (!signupDraft) return null;

  function addTerm() {
    const clean = term.trim().replace(/\s+/g, " ");
    if (clean && clean.length <= 60 && terms.length < 10 && !terms.some(t => t.toLowerCase() === clean.toLowerCase())) setTerms([...terms, clean]);
    setTerm("");
  }
  async function finish(skip = false) {
    setBusy(true);
    await store.register({...signupDraft, categoryIds: skip ? [] : categoryIds, productInterests: skip ? [] : terms, marketing: skip ? false : marketing});
    signupDraft = null;
    navigate("/inicio");
  }

  return <main className="auth-page"><div className="auth-shell">
    <div className="auth-top"><button type="button" className="back-button" aria-label="Voltar" onClick={() => navigate("/cadastro")}><Icon name="back" size={22} /></button>
      <button type="button" className="text-button demo-skip" disabled={busy} onClick={() => finish(true)}>Pular</button></div>
    <div className="auth-progress" aria-hidden="true"><span className="active" /><span className="active" /></div>
    <h1>Do que você gosta?</h1>
    <p className="auth-lead">Escolha categorias para montar sua Home e suas promoções.</p>
    <div className="auth-form">
      <CategoryGrid categories={CATEGORIES} selected={categoryIds} onChange={setCategoryIds} disabled={busy} />
      <div className="form-field"><label htmlFor={termId}>Produtos que você deseja</label>
        <div className="demo-input-icon"><Icon name="search" size={20} /><input id={termId} value={term} placeholder="Ex.: fone bluetooth, tênis de corrida" maxLength={60}
          onChange={e => setTerm(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTerm(); } }} onBlur={addTerm} /></div>
        <small>Pressione Enter para adicionar (até 10).</small>
        {terms.length > 0 && <div className="interest-chips">{terms.map(t => <span className="interest-chip" key={t}>{t}<button type="button" aria-label={`Remover ${t}`} onClick={() => setTerms(terms.filter(x => x !== t))}>×</button></span>)}</div>}
      </div>
      <label className="consent-card"><span className="consent-copy"><strong>Receber ofertas por e-mail?</strong><span>Avisamos quando algo da sua lista de desejos entrar em promoção. Você pode mudar isso no Perfil.</span></span>
        <span className="consent-switch"><input type="checkbox" role="switch" checked={marketing} onChange={e => setMarketing(e.target.checked)} /><span className="consent-track" /></span></label>
      <button className="primary-button" disabled={busy} onClick={() => finish(false)}>{busy && <span className="spinner" />}Concluir cadastro</button>
    </div>
  </div></main>;
}

/** Tela 04 — Recuperação de senha com código de 6 dígitos (simulado: nenhum e-mail é enviado). */
export function DemoRecoveryView() {
  const store = useDemoStore();
  const [email, setEmail] = useState(store.lastAccount?.email ?? ""), [sent, setSent] = useState(null), [countdown, setCountdown] = useState(0);
  const [digits, setDigits] = useState(Array(6).fill("")), [password, setPassword] = useState("");
  const [error, setError] = useState(null), [done, setDone] = useState(false);
  const inputs = useRef([]), emailId = useId(), passwordId = useId();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function send() {
    if (!EMAIL.test(email.trim())) { setError("Informe um e-mail válido."); return; }
    setError(null);
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    setSent({email: email.trim().toLowerCase(), code, known: store.emailExists(email)});
    setDigits(Array(6).fill("")); setCountdown(60);
    setTimeout(() => inputs.current[0]?.focus(), 0);
  }
  function typeDigit(index, value) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) { // colar o código inteiro
      const next = clean.slice(0, 6).split(""); while (next.length < 6) next.push("");
      setDigits(next); inputs.current[Math.min(clean.length, 5)]?.focus(); return;
    }
    const next = [...digits]; next[index] = clean; setDigits(next);
    if (clean && index < 5) inputs.current[index + 1]?.focus();
  }
  async function confirm(event) {
    event.preventDefault();
    if (digits.join("") !== sent.code) { setError("Código incorreto. Confira os 6 dígitos."); return; }
    if (password.length < 8) { setError("A nova senha precisa de pelo menos 8 caracteres."); return; }
    if (!sent.known) { setError("Não há conta de demonstração com esse e-mail."); return; }
    await store.resetPassword(sent.email, password);
    setDone(true);
  }
  const masked = sent ? sent.email.replace(/^(.)[^@]*/, (_, first) => first + "•••••") : "";

  if (done) return <main className="auth-page"><div className="auth-shell">
    <span className="demo-icon-box"><Icon name="check" size={30} /></span>
    <h1>Senha alterada</h1><p className="auth-lead">Use a nova senha para entrar na sua conta de demonstração.</p>
    <button className="primary-button" onClick={() => navigate("/entrar")}>Ir para o login</button>
  </div></main>;

  return <main className="auth-page"><div className="auth-shell">
    <div className="auth-top"><button type="button" className="back-button" aria-label="Voltar" onClick={() => navigate("/entrar")}><Icon name="back" size={22} /></button></div>
    <span className="demo-icon-box"><Icon name="mail" size={30} /></span>
    <h1>Esqueceu a senha?</h1>
    <p className="auth-lead">Informe o e-mail da conta. Enviaremos um código de confirmação para você criar uma nova senha.</p>
    <form className="auth-form" onSubmit={confirm} noValidate>
      <FormFeedback message={error} />
      <div className="form-field"><label htmlFor={emailId}>E-mail</label>
        <input id={emailId} type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setSent(null); }} /></div>
      <button type="button" className="secondary-button demo-wide" onClick={send} disabled={Boolean(sent)}>{sent ? <>Código enviado <Icon name="check" size={18} /></> : "Enviar código"}</button>
      {sent && <>
        <hr className="demo-rule" />
        <p className="demo-code-copy">Digite o código de 6 dígitos enviado para <strong>{masked}</strong></p>
        <p className="form-feedback info" role="status">Modo demonstração: nenhum e-mail é enviado. Seu código é <strong>{sent.code}</strong>.</p>
        <div className="demo-code" role="group" aria-label="Código de 6 dígitos">
          {digits.map((d, i) => <input key={i} ref={el => { inputs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={6}
            aria-label={`Dígito ${i + 1}`} className={d ? "is-filled" : undefined} value={d} onChange={e => typeDigit(i, e.target.value)}
            onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) inputs.current[i - 1]?.focus(); }} />)}
        </div>
        <p className="muted">Não recebeu? {countdown > 0 ? <>Reenviar em <strong>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}</strong></> : <button type="button" className="text-button" onClick={() => { setSent(null); setTimeout(send, 0); }}>Reenviar código</button>}</p>
        <div className="form-field"><label htmlFor={passwordId}>Nova senha</label>
          <PasswordInput id={passwordId} value={password} onChange={setPassword} autoComplete="new-password" /></div>
        <button className="primary-button">Confirmar e criar nova senha</button>
      </>}
    </form>
  </div></main>;
}
