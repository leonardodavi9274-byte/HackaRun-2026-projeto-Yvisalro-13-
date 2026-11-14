import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {DEMO_ACCOUNT, productById} from "../data/catalog.js";
import {bestOffer} from "../models/catalog-model.js";

/**
 * Estado da demonstração guardado só neste navegador (localStorage). Nada é enviado à API
 * e nenhum e-mail é disparado. Senhas criadas na demonstração são guardadas como hash SHA-256.
 */
const KEY = "hackarum-demo-v1";
const Context = createContext(null);

async function hash(text) {
  const bytes = new TextEncoder().encode("hackarum-demo:" + text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

function initialState() {
  const {password: _password, ...account} = DEMO_ACCOUNT;
  return {accounts: {[account.email]: {...account, photo: null, passwordHash: null}}, currentEmail: null, lastEmail: account.email, dismissedOffers: []};
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (parsed?.accounts) return parsed;
  } catch { /* armazenamento indisponível: começa do zero */ }
  return initialState();
}

export function DemoStoreProvider({children}) {
  const [state, setState] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* modo privado */ } }, [state]);

  const account = state.currentEmail ? state.accounts[state.currentEmail] ?? null : null;
  const update = useCallback(change => setState(s => {
    if (!s.currentEmail) return s;
    const current = s.accounts[s.currentEmail];
    return {...s, accounts: {...s.accounts, [s.currentEmail]: {...current, ...change(current)}}};
  }), []);

  const api = useMemo(() => ({
    account,
    lastAccount: state.lastEmail ? state.accounts[state.lastEmail] ?? null : null,
    demoCredentials: {email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password},
    dismissedOffers: state.dismissedOffers,

    async login(email, password) {
      const key = email.trim().toLowerCase(), found = state.accounts[key];
      if (!found) throw new Error("Não encontramos uma conta de demonstração com esse e-mail.");
      const ok = found.passwordHash ? found.passwordHash === await hash(password) : password === DEMO_ACCOUNT.password && key === DEMO_ACCOUNT.email;
      if (!ok) throw new Error("E-mail ou senha incorretos.");
      setState(s => ({...s, currentEmail: key, lastEmail: key}));
    },
    logout() { setState(s => ({...s, currentEmail: null})); },
    forgetLastAccount() { setState(s => ({...s, lastEmail: null})); },
    emailExists: email => Boolean(state.accounts[email.trim().toLowerCase()]),

    async register({name, email, password, photo, categoryIds, productInterests, marketing}) {
      const key = email.trim().toLowerCase(), passwordHash = await hash(password);
      setState(s => ({...s, currentEmail: key, lastEmail: key, accounts: {...s.accounts, [key]: {
        name: name.trim(), email: key, passwordHash, photo: photo ?? null, categoryIds, productInterests, marketing,
        wishes: [], alerts: [], recentSearches: [],
      }}}));
    },
    async resetPassword(email, password) {
      const key = email.trim().toLowerCase(), passwordHash = await hash(password);
      setState(s => s.accounts[key] ? {...s, accounts: {...s.accounts, [key]: {...s.accounts[key], passwordHash}}} : s);
    },

    isWished: productId => Boolean(account?.wishes.some(w => w.productId === productId)),
    toggleWish(productId) {
      update(a => a.wishes.some(w => w.productId === productId)
        ? {wishes: a.wishes.filter(w => w.productId !== productId)}
        : {wishes: [{productId, savedCents: bestOffer(productById(productId)).priceCents}, ...a.wishes]});
    },
    hasAlert: productId => Boolean(account?.alerts.some(a => a.productId === productId)),
    addAlert(productId, kind = "restock", targetCents = null) {
      update(a => a.alerts.some(x => x.productId === productId) ? {} : {alerts: [{productId, kind, targetCents}, ...a.alerts]});
    },
    removeAlert(productId) { update(a => ({alerts: a.alerts.filter(x => x.productId !== productId)})); },
    recordSearch(term) {
      const clean = term.trim();
      if (clean) update(a => ({recentSearches: [clean, ...a.recentSearches.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6)}));
    },
    clearSearches() { update(() => ({recentSearches: []})); },
    updatePreferences(change) { update(() => change); },
    dismissOffer(id) { setState(s => ({...s, dismissedOffers: [...new Set([...s.dismissedOffers, id])]})); },
    resetDemo() { try { localStorage.removeItem(KEY); } catch { /* ignora */ } setState(initialState()); },
  }), [state, account, update]);

  return <Context.Provider value={api}>{children}</Context.Provider>;
}

export function useDemoStore() {
  const value = useContext(Context);
  if (!value) throw new Error("useDemoStore precisa de DemoStoreProvider.");
  return value;
}
