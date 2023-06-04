import { FormOptions } from "@formeus/core"
import { Ref } from "vue"

export type UseFormOptions<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = {
  [Key in keyof FormOptions<TForm, TMeta>]: Key extends "initial"
    ? Ref<TForm> | TForm
    : Key extends "meta"
    ? Ref<TMeta> | TMeta
    : FormOptions<TForm, TMeta>[Key]
}
