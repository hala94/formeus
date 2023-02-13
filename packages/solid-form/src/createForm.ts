import { createForm as createFormCore } from "@9/form-core"
import type { FormOptions } from "@9/form-core"
import { createStore } from "solid-js/store"
import { onCleanup } from "solid-js"

export function createForm<TForm extends Record<string, unknown>>(
  args: FormOptions<TForm>
) {
  const observable = createFormCore(args)

  const [store, setStore] = createStore(observable.getSnapshot())

  const unsubscribe = observable.subscribe(setStore)

  onCleanup(unsubscribe)

  return store
}
