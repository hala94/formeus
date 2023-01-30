import { createForm as createFormCore } from "@dh/form-core";
import type { FormProps } from "@dh/form-core";
import { createStore } from "solid-js/store";
import { onCleanup } from "solid-js";

export function createForm<TForm extends Record<string, unknown>>(
  args: FormProps<TForm>
) {
  const observable = createFormCore(args);

  const [store, setStore] = createStore(observable.getSnapshot());

  const unsubscribe = observable.subscribe(setStore);

  onCleanup(unsubscribe);

  return store;
}
