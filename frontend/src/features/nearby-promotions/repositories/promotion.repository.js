import {getJson} from "../../../shared/services/http-client.js";
export const promotionRepository={
 list:(mallId,signal)=>getJson(`/promotions?mallId=${encodeURIComponent(mallId)}`,{signal}),
 confirm:(mallId,offer,signal)=>getJson(`/promotions/${encodeURIComponent(offer.id)}?mallId=${encodeURIComponent(mallId)}&revision=${encodeURIComponent(offer.revision)}`,{signal}),
};
