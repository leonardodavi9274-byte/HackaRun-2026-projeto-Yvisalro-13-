/**
 * Grafo de caminhos do documento e Dijkstra (research D3). Arestas bidirecionais;
 * "walk" usa a distância euclidiana em metros, conexões entre pisos usam lengthM.
 */
export function buildGraph(index){
 const graph=new Map();
 for(const id of index.nodeById.keys())graph.set(id,[]);
 for(const edge of index.edges){
  const a=index.nodeById.get(edge.from),b=index.nodeById.get(edge.to);
  if(!a||!b)continue;
  const length=edge.kind==="walk"?Math.hypot(b.x-a.x,b.y-a.y):edge.lengthM;
  graph.get(edge.from).push({to:edge.to,length,kind:edge.kind});
  graph.get(edge.to).push({to:edge.from,length,kind:edge.kind});
 }
 return graph;
}

function dijkstra(graph,source){
 const dist=new Map([[source,0]]),prev=new Map(),done=new Set();
 for(;;){
  let current=null,best=Infinity;
  for(const [node,d] of dist)if(!done.has(node)&&d<best){best=d;current=node;}
  if(current===null)break;
  done.add(current);
  for(const edge of graph.get(current)??[]){
   const candidate=best+edge.length;
   if(candidate<(dist.get(edge.to)??Infinity)){dist.set(edge.to,candidate);prev.set(edge.to,{from:current,edge});}
  }
 }
 return {dist,prev};
}

/** Caminho mais curto entre dois nós, ou null quando não há caminho conhecido. */
export function shortestPath(graph,from,to){
 if(!graph.has(from)||!graph.has(to))return null;
 const {dist,prev}=dijkstra(graph,from);
 if(!dist.has(to))return null;
 const nodes=[to],legs=[];
 for(let node=to;node!==from;){const step=prev.get(node);legs.unshift({from:step.from,to:node,kind:step.edge.kind,length:step.edge.length});nodes.unshift(step.from);node=step.from;}
 return {nodes,legs,totalM:dist.get(to)};
}

/** Distâncias de caminhada simulada a partir de um nó (Dijkstra de fonte única). */
export const distancesFrom=(graph,from)=>graph.has(from)?dijkstra(graph,from).dist:new Map();

/** Lojas com posição e caminho, ordenadas pela distância até a porta da unidade. */
export function nearestStores(index,graph,fromNode,limit=5){
 const dist=distancesFrom(graph,fromNode);
 return index.stores.filter(s=>s.positioned)
  .map(store=>({store,distanceM:dist.get(index.unitById.get(store.unitId).door)}))
  .filter(item=>item.distanceM!==undefined)
  .sort((a,b)=>a.distanceM-b.distanceM||a.store.name.localeCompare(b.store.name,"pt-BR"))
  .slice(0,limit);
}
