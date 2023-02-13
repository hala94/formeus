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
import { createForm, FormOptions, FormResult } from "@9/form-core"

type ReadOnlyResult<TData> = ReturnType<typeof readonly<FormResult<TData>>>
type RefsResult<TData> = ToRefs<ReadOnlyResult<TData>>

export function useForm<TData extends Record<string, unknown>>(
  props: FormOptions<TData>
): RefsResult<TData> {
  const observable = createForm(unref(props))

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
