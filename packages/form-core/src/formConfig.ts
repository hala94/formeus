import { FormConfig } from "./types"

// Default config
let staticConfig: FormConfig = {
  autoValidate: false,
  validateConcurrentlyOnSubmit: false,
}

export function setFormConfig(config: FormConfig) {
  if (!config || typeof config != "object") return
  staticConfig = config
}

export function getFormConfig() {
  return staticConfig
}
