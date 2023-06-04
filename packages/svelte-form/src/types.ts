import { FormOptions } from "@formeus/core"
import { Readable, Writable } from "svelte/store"

export type CreateFormOptions<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = {
  [Key in keyof FormOptions<TForm, TMeta>]: Key extends "initial"
    ? Readable<TForm> | TForm
    : Key extends "meta"
    ? Readable<TMeta> | TMeta
    : FormOptions<TForm, TMeta>[Key]
}
