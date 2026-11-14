import {useEffect,useState} from "react";
export function navigate(path,{replace=false}={}){if(path===window.location.pathname+window.location.search&&!window.location.hash)return;window.history[replace?"replaceState":"pushState"]({},"",path);window.dispatchEvent(new Event("app:navigate"));window.scrollTo(0,0);}
function useLocationValue(read){const [value,setValue]=useState(read);useEffect(()=>{const update=()=>setValue(read());addEventListener("popstate",update);addEventListener("app:navigate",update);return()=>{removeEventListener("popstate",update);removeEventListener("app:navigate",update);};},[]);return value;}
export const usePath=()=>useLocationValue(()=>location.pathname);
export const useSearch=()=>useLocationValue(()=>location.search);

// Destino de resultados da busca. A rota /buscar e os parâmetros q/categoria são o ponto
// de integração com a feature 005; o termo é transportado sem alteração.
export const SEARCH_PATH="/buscar";
export function searchPath({query,categoryId}={}){const p=new URLSearchParams();if(query)p.set("q",query);if(categoryId)p.set("categoria",categoryId);const s=p.toString();return SEARCH_PATH+(s?"?"+s:"");}
export function readSearchIntent(search){const p=new URLSearchParams(search);return {query:p.get("q"),categoryId:p.get("categoria")};}
