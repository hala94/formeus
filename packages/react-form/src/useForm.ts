import { useState } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim"
import { createForm, FormOptions, FormResult } from "@formeus/core"

export function useForm<TForm extends Record<string, unknown>>(
  props: FormOptions<TForm>
): FormResult<TForm> {
  const [subscribable] = useState(() => createForm(props))

  return useSyncExternalStore(
    subscribable.subscribe,
    subscribable.getSnapshot,
    subscribable.getSnapshot
  )
}
