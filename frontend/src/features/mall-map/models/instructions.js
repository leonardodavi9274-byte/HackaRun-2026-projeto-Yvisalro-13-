import {floorName} from "./map-document.js";
import {shortestPath} from "./pathfinding.js";

/**
 * Tabela única kind → ícone e verbo (research D4). Texto e seta de cada instrução saem
 * sempre desta tabela, a partir do mesmo kind calculado: a divergência da tela 10 não
 * pode reaparecer.
 */
export const DIRECTIONS={
 straight:{icon:"straight",verb:"siga em frente"},
 "slight-left":{icon:"slight-left",verb:"siga levemente à esquerda"},
 "slight-right":{icon:"slight-right",verb:"siga levemente à direita"},
 left:{icon:"left",verb:"vire à esquerda"},
 right:{icon:"right",verb:"vire à direita"},
 "u-turn":{icon:"u-turn",verb:"faça o retorno"},
 "floor-change":{icon:"floor-change"},
 arrive:{icon:"arrive"},
};
const CONNECTOR_ARTICLE={escalator:"a escada rolante",stairs:"a escada",elevator:"o elevador"};
export const CONNECTOR_NAME={escalator:"escada rolante",stairs:"escada",elevator:"elevador"};
const WALKING_M_PER_MIN=70;

/**
 * Direção no vértice b entre os trechos a→b e b→c. Eixo y para baixo (SVG):
 * cross > 0 → direita; cross < 0 → esquerda (inverte o sinal cartesiano).
 * Faixas: até 30° straight; 30–60° slight-*; 60–150° left/right; acima de 150° u-turn.
 */
export function turnKind(a,b,c){
 const cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
 const dot=(b.x-a.x)*(c.x-b.x)+(b.y-a.y)*(c.y-b.y);
 const angle=Math.abs(Math.atan2(cross,dot))*180/Math.PI;
 if(angle<=30)return "straight";
 if(angle>150)return "u-turn";
 const side=cross>0?"right":"left";
 return angle<=60?`slight-${side}`:side;
}

export const roundDistance=m=>m<=0?0:Math.max(5,Math.round(m/5)*5);
/** etaMin = ceil(totalM / 70), mínimo 1 minuto. */
export const etaMinutes=m=>Math.max(1,Math.ceil(m/WALKING_M_PER_MIN));
export const formatMeters=m=>`${Math.round(m)} m`;
const capitalize=s=>s.charAt(0).toLocaleUpperCase("pt-BR")+s.slice(1);

export function instructionText(instruction,{storeName,floorNameOf}){
 const d=roundDistance(instruction.distanceM),lead=d?`Em ${d} m, `:"";
 switch(instruction.kind){
  case "floor-change":return capitalize(`${lead}pegue ${CONNECTOR_ARTICLE[instruction.connector]} até o ${floorNameOf(instruction.toFloorId)}`);
  case "arrive":return d?`Em ${d} m, chegue à ${storeName}`:`Você chegou à ${storeName}`;
  case "straight":return `Siga em frente por ${d} m`;
  default:return capitalize(lead+DIRECTIONS[instruction.kind].verb);
 }
}

function landmarkAt(index,graph,nodeId,destinationStoreId){
 const point=[...index.pointById.values()].find(p=>p.node===nodeId);
 if(point)return point.label;
 for(const edge of graph.get(nodeId)??[]){const store=index.storeByDoor.get(edge.to);if(store&&store.id!==destinationStoreId)return store.name;}
 return null;
}

/**
 * Calcula a rota simulada entre um ponto de referência e a porta da loja.
 * Retorna null quando a loja não tem posição ou não há caminho conhecido.
 */
export function buildRoute(index,graph,{startPointId,storeId}){
 const point=index.pointById.get(startPointId),store=index.storeById.get(storeId);
 if(!point||!store?.positioned)return null;
 const path=shortestPath(graph,point.node,index.unitById.get(store.unitId).door);
 if(!path)return null;
 const {nodes,legs}=path,node=id=>index.nodeById.get(id);
 const instructions=[];let walked=0,segmentStart=0,lastConnector=null;
 for(let i=0;i<legs.length;){
  const leg=legs[i];
  if(leg.kind!=="walk"){
   let j=i,length=0;
   while(j<legs.length&&legs[j].kind===leg.kind){length+=legs[j].length;j++;}
   instructions.push({kind:"floor-change",distanceM:walked,legM:walked+length,floorId:node(nodes[i]).floorId,toFloorId:node(nodes[j]).floorId,connector:leg.kind,fromIndex:segmentStart,toIndex:i,landmark:null});
   lastConnector=leg.kind;walked=0;segmentStart=j;i=j;continue;
  }
  walked+=leg.length;
  if(legs[i+1]?.kind==="walk"){
   const kind=turnKind(node(nodes[i]),node(nodes[i+1]),node(nodes[i+2]));
   if(kind!=="straight"){
    instructions.push({kind,distanceM:walked,legM:walked,floorId:node(nodes[i+1]).floorId,fromIndex:segmentStart,toIndex:i+1,landmark:landmarkAt(index,graph,nodes[i+1],store.id)});
    walked=0;segmentStart=i+1;
   }
  }
  i++;
 }
 instructions.push({kind:"arrive",distanceM:walked,legM:walked,floorId:store.floorId,fromIndex:segmentStart,toIndex:nodes.length-1,landmark:null});

 const context={storeName:store.name,floorNameOf:id=>floorName(index,id)};
 let remaining=path.totalM;
 for(const instruction of instructions){
  instruction.remainingM=remaining;
  instruction.text=instructionText(instruction,context);
  instruction.icon=DIRECTIONS[instruction.kind].icon;
  remaining-=instruction.legM;
 }
 return {startPointId,storeId,storeName:store.name,nodes,totalM:path.totalM,etaMin:etaMinutes(path.totalM),instructions,arrivalFloorId:store.floorId,arrivalConnector:lastConnector};
}
