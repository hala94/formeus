import { FormConfig } from "./types"

let staticConfig: FormConfig | undefined

export function setFormConfig(config: FormConfig) {
  staticConfig = config
}

export function getFormConfig() {
  return staticConfig
}
