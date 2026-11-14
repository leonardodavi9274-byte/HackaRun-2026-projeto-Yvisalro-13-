/**
 * Cálculo local da localização (research D6). As coordenadas do dispositivo entram só
 * nestas funções e não são guardadas nem enviadas: o resultado contém apenas o estado e
 * a distância ao shopping.
 */
const EARTH_RADIUS_M=6371000;
const rad=deg=>deg*Math.PI/180;

export function haversineMeters(a,b){
 const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
 return 2*EARTH_RADIUS_M*Math.asin(Math.min(1,Math.sqrt(h)));
}

/** Classifica a posição como "inside" ou "outside" do raio do shopping. */
export function classifyPosition(mall,latitude,longitude){
 const distanceM=haversineMeters({lat:latitude,lng:longitude},mall.reference);
 return distanceM<=mall.areaRadiusM?{status:"inside"}:{status:"outside",distanceM};
}

/** Abaixo de 1 km em metros arredondados a 10 m; acima, em km com uma casa decimal. */
export function formatDistance(meters){
 if(meters<1000)return `${Math.max(10,Math.round(meters/10)*10)} m`;
 return `${(meters/1000).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})} km`;
}
