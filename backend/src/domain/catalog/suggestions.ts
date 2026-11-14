import {normalizeSearch} from "./search.ts";
function distanceOne(a:string,b:string):boolean {
 if(Math.abs(a.length-b.length)>1||a===b)return false;
 let i=0,j=0,edits=0;
 while(i<a.length&&j<b.length){
  if(a[i]===b[j]){i++;j++;continue;}
  if(++edits>1)return false;
  if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}
 }
 return edits+(i<a.length||j<b.length?1:0)===1;
}
export function suggest(term:string,candidates:string[]):string|null {
 const q=normalizeSearch(term);if(q.length<4||/\s/.test(q))return null;
 const words=candidates.flatMap(c=>c.split(/\s+/)).filter(c=>normalizeSearch(c).length>=4);
 return words.filter(w=>distanceOne(q,normalizeSearch(w)))
  .sort((a,b)=>normalizeSearch(a).localeCompare(normalizeSearch(b),"pt-BR")||a.localeCompare(b,"pt-BR"))[0]??null;
}
