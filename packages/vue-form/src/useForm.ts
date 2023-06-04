import {
  unref,
  reactive,
  onMounted,
  onScopeDispose,
  toRefs,
  readonly,
  ref,
  ToRefs,
  watch,
  isRef,
} from "vue"
import { createForm, FormOptions, FormResult } from "@formeus/core"
import { UseFormOptions } from "./types"

type ReadOnlyResult<TData> = ReturnType<typeof readonly<FormResult<TData>>>
type RefsResult<TData> = ToRefs<ReadOnlyResult<TData>>

export function useForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: UseFormOptions<TForm, TMeta>): RefsResult<TForm> {
  const observable = createForm(normalizeFormOptions(options))

  const form = reactive(observable.getSnapshot())

  const unsubscribeRef = ref(() => {
    // noop
  })

  onMounted(() => {
    unsubscribeRef.value = observable.subscribe((updated) => {
      Object.assign(form, updated)
    })
  })

  if (isRef(options.initial)) {
    watch(
      () => unref(options.initial),
      (newInitial) => {
        observable.setInitial(newInitial)
      }
    )
  }

  onScopeDispose(() => unsubscribeRef.value())

  const readonlyForm = readonly(form)
  const formRefs = toRefs(readonlyForm)

  return {
    ...formRefs,
  }
}

function normalizeFormOptions<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: UseFormOptions<TForm, TMeta>): FormOptions<TForm, TMeta> {
  return {
    ...options,
    initial: isRef(options.initial) ? options.initial.value : options.initial,
    meta: isRef(options.meta) ? options.meta.value : options.meta,
  }
}
