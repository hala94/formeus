import { useEffect, useState } from "react"
import { createForm, FormOptions } from "@formeus/core"

export function useBaseForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>) {
  const [subscribable] = useState(() => createForm(options))

  useEffect(() => {
    options.meta && subscribable.setMeta(options.meta)
  }, [options.meta, subscribable])

  return subscribable
}
