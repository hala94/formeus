import { FormOptions, createForm as createFormInternal } from "@9/form-core"
import { readable } from "svelte/store"

export function createForm<TForm extends Record<string, unknown>>(
  options: FormOptions<TForm>
) {
  const observable = createFormInternal(options)

  const store = readable(observable.getSnapshot(), (set) => {
    const unsubscribe = observable.subscribe((updated) => set(updated))

    return () => {
      unsubscribe()
    }
  })

  return store
}
