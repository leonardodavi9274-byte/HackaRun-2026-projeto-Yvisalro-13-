import {useEffect,useState} from "react";
const current=()=>location.pathname+location.search;
export function navigate(path,{replace=false}={}){if(path===current()&&!window.location.hash)return;window.history[replace?"replaceState":"pushState"]({},"",path);window.dispatchEvent(new Event("app:navigate"));window.scrollTo(0,0);}
function useLocationValue(read){const [value,setValue]=useState(read);useEffect(()=>{const update=()=>setValue(read());addEventListener("popstate",update);addEventListener("app:navigate",update);return()=>{removeEventListener("popstate",update);removeEventListener("app:navigate",update);};},[]);return value;}
const readPath=()=>location.pathname,readSearch=()=>location.search;
export function usePath(){return useLocationValue(readPath);}
/** Parâmetros da URL atual (ex.: /mapa?loja=grao-fino), atualizados na navegação. */
export function useSearchParam(name){return new URLSearchParams(useLocationValue(readSearch)).get(name);}
