import { getJson } from "../../../shared/services/http-client.js";
import { createSystemStatus } from "../models/system-status.js";

export const systemRepository = {
  async getStatus({ signal } = {}) {
    return createSystemStatus(await getJson("/health", { signal }));
  },
};
