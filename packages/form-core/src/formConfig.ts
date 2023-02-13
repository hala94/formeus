import { FormConfig } from "./types"

let staticConfig: FormConfig | undefined = {
  autoValidate: false,
  validateConcurrentlyOnSubmit: false,
}

export function setFormConfig(config: FormConfig) {
  staticConfig = config
}

export function getFormConfig() {
  return staticConfig
}
