import { useState, useSyncExternalStore } from "react";
import { createForm, FormProps } from "@dh/form-core";

export function useForm<TForm extends Record<string, unknown>>(
  props: FormProps<TForm>
) {
  const [subscribable] = useState(createForm(props));

  return useSyncExternalStore(
    subscribable.subscribe,
    subscribable.getSnapshot,
    subscribable.getSnapshot
  );
}
