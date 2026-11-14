import {getJson} from "../../../shared/services/http-client.js";
/** GET /api/v1/mall. Nunca envia coordenadas do dispositivo nem ponto de partida (FR-014). */
export const mallRepository={load:signal=>getJson("/mall",{signal})};
