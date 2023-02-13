import { useState, useSyncExternalStore } from "react"
import { createForm, FormOptions } from "@9/form-core"

export function useForm<TForm extends Record<string, unknown>>(
  props: FormOptions<TForm>
) {
  const [subscribable] = useState(createForm(props))

  return useSyncExternalStore(
    subscribable.subscribe,
    subscribable.getSnapshot,
    subscribable.getSnapshot
  )
}
