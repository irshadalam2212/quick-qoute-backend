import { unitRepository } from "../repositories/unit.repository.js";

export const unitService = {
  list() {
    return unitRepository.findActive();
  },
};
