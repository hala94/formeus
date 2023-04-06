import { useEffect, useState } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"
import { createForm, FormOptions, FormResult } from "@formeus/core"

export function useForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>): FormResult<TForm> {
  const [subscribable] = useState(() => createForm(options))

  useEffect(() => {
    options.meta && subscribable.setMeta(options.meta)
  }, [options.meta, subscribable])

  return useSyncExternalStore(
    subscribable.subscribe,
    subscribable.getSnapshot,
    subscribable.getSnapshot
  )
}
