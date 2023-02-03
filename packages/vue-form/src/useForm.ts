import {
  unref,
  reactive,
  onMounted,
  onScopeDispose,
  toRefs,
  readonly,
  ref,
} from "vue";
import { createForm, FormProps, FormResult } from "@9/form-core";

export function useForm<TData extends Record<string, unknown>>(
  props: FormProps<TData>
) {
  const observable = createForm(unref(props));

  const form = reactive(observable.getSnapshot());

  const unsubscribeRef = ref(() => {
    // noop
  });

  onMounted(() => {
    unsubscribeRef.value = observable.subscribe((updated) => {
      Object.assign(form, updated);
    });
  });

  onScopeDispose(() => unsubscribeRef.value());

  return {
    ...toRefs(readonly(form) as FormResult<TData>),
  };
}
