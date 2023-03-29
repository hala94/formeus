import {
  FormOptions,
  createForm as createFormInternal,
  FormResult,
} from "@formeus/core"
import { Readable, readable } from "svelte/store"

export function createForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = {}
>(options: FormOptions<TForm, TMeta>): Readable<FormResult<TForm>> {
  const observable = createFormInternal(options)

  const store = readable(observable.getSnapshot(), (set) => {
    const unsubscribe = observable.subscribe((updated) => set(updated))

    return () => {
      unsubscribe()
    }
  })

  return store
}
