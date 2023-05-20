import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"
import { FormOptions } from "@formeus/core"
import { useBaseForm } from "./useBaseForm"

export function useForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>) {
  const subscribable = useBaseForm(options)

  return useSyncExternalStore(
    subscribable.subscribe,
    subscribable.getSnapshot,
    subscribable.getSnapshot
  )
}
