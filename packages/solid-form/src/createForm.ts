import { createForm as createFormCore, FormResult } from "@formeus/core"
import type { FormOptions } from "@formeus/core"
import { createStore } from "solid-js/store"
import { onCleanup } from "solid-js"

export function createForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>): FormResult<TForm> {
  const observable = createFormCore(options)

  const [store, setStore] = createStore(observable.getSnapshot())

  const unsubscribe = observable.subscribe(setStore)

  onCleanup(unsubscribe)

  return store
}
