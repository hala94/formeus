import {
  unref,
  reactive,
  onMounted,
  onScopeDispose,
  toRefs,
  readonly,
  ref,
  ToRefs,
} from "vue"
import { createForm, FormOptions, FormResult } from "@formeus/core"

type ReadOnlyResult<TData> = ReturnType<typeof readonly<FormResult<TData>>>
type RefsResult<TData> = ToRefs<ReadOnlyResult<TData>>

export function useForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = {}
>(options: FormOptions<TForm, TMeta>): RefsResult<TForm> {
  const observable = createForm(unref(options))

  const form = reactive(observable.getSnapshot())

  const unsubscribeRef = ref(() => {
    // noop
  })

  onMounted(() => {
    unsubscribeRef.value = observable.subscribe((updated) => {
      Object.assign(form, updated)
    })
  })

  onScopeDispose(() => unsubscribeRef.value())

  const readonlyForm = readonly(form)
  const formRefs = toRefs(readonlyForm)

  return {
    ...formRefs,
  }
}
