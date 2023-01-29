import { Component, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import { createForm } from "@dh/form-core";
import type { FormProps } from "@dh/form-core";

function createSolidForm<TForm extends Record<string, unknown>>(
  args: FormProps<TForm>
) {
  const observable = createForm(args);

  const [store, setStore] = createStore(observable.getSnapshot());

  const unsubscribe = observable.subscribe(setStore);

  onCleanup(() => {
    unsubscribe();
  });

  return store;
}

const App: Component = () => {
  const store = createSolidForm({
    initial: { name: "", email: "" },
    clientValidators: {
      name: ({ name }) => {
        return name.length < 5 ? new Error("Too short") : undefined;
      },
    },
    serverValidators: {
      email: ({ email }) => {
        return Promise.resolve(undefined).then(delayResult);
      },
    },
    config: {
      autoValidate: true,
    },
  });

  return (
    <div>
      <p class="text-4xl text-green-700 text-center py-20">Hellooo</p>
      <div class="flex flex-col gap-2">
        <input
          class="border"
          placeholder="enter..."
          value={store.form.name}
          onInput={(e) => {
            store.update("name", e.currentTarget.value);
          }}
        />
        <input
          class="border"
          placeholder="email..."
          value={store.form.email}
          onInput={(e) => {
            store.update("email", e.currentTarget.value);
          }}
        />
        <div>isValid: {store.isValid.toString()}</div>
        <div>isValidating: {store.isValidating.toString()}</div>
        <div>validations: {JSON.stringify(store.validations)}</div>
      </div>
    </div>
  );
};

export default App;

function createTest() {
  const [count, setCount] = createSignal(0);

  const interval = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  onCleanup(() => clearInterval(interval));

  return count;
}

function delayResult<T>(value: T, delay: number = 3000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}
