import { FormOptions } from "@formeus/core"
import { Accessor } from "solid-js"

export type CreateFormOptions<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = {
  [Key in keyof FormOptions<TForm, TMeta>]: Key extends "initial"
    ? Accessor<TForm> | TForm
    : Key extends "meta"
    ? Accessor<TMeta> | TMeta
    : FormOptions<TForm, TMeta>[Key]
}
