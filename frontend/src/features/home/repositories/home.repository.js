import {getJson} from "../../../shared/services/http-client.js";
import {createHomeContent} from "../models/home.js";
// O navegador só conversa com a WebAPI; nenhuma chave do Supabase chega aqui.
export const homeRepository={async get({signal}={}){return createHomeContent(await getJson("/home",{signal}));}};
