import { Component, JSX, createEffect, createSignal, onCleanup } from "solid-js"
import { AsyncValidators, Validators, createForm } from "@formeus/solid"


type Form = {
  email: string
  password: string
  username: string
  project: string
}

const initial: Form = {
  email: "",
  password: "",
  username: "",
  project: "",
}

const validators: Validators<Form> = {
  email: ({ email }) =>
    /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{5,})\S/.test(email)
      ? undefined
      : new Error("1 uppercase, 1 lowercase, 1 number and at least 6 chars."),
  // email.length == 0 ? new Error("Email validation failed.") : undefined,
  password: ({ password }) =>
    password.length < 5 ? new Error("Enter at least 5 chars.") : undefined,
  username: ({ username }) =>
    username.length == 0 ? new Error("Username validation failed.") : undefined,
}

const asyncValidators: AsyncValidators<Form> = {
  email: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult)
  },
  username: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult)
  },
}
const App: Component = () => {

  const [serverForm, setServerForm] = createSignal<Form>(initial);

  createEffect(() => {
    const timeout = setTimeout(() => {

      setServerForm({
        email: "server@mail.com",
        username: "loosername",
        password: "123",
        project: "WHAT",
      });
    }, 5000);

    onCleanup(() => {
      clearTimeout(timeout);
    });
  });

  function generateInputProps(): JSX.Element[] {
    return Object.keys(initial).map((key) => {
      const formKey = key as keyof Form;
      return (
        <>
        <input class="border rounded-md h-12 px-4"
          value={store.values[formKey]}
          checked={store.validations[formKey].checked}
          disabled={store.isSubmitting}
          onInput={(e) => store.update(formKey, e.currentTarget.value)}
        />
        <div>isvalidating: {JSON.stringify(store.validations[formKey].validating)}</div>
        <div>error: {store.validations[formKey].error?.message}</div>
        </>

      );
    });
  }

  const store = createForm({
    initial: serverForm,
    onSubmitForm: (latest, meta, modified) => {
      console.log("on submit reported modified fields, ", JSON.stringify(modified));
      setServerForm(latest);
    },
    validators,
    asyncValidators,
    comparators: {
      email: (newValue, oldValue) => {
        return newValue.length === oldValue.length;
      },
    },
    config: { autoValidate: false, validateConcurrentlyOnSubmit: false },
  });


  return (
    <>
      <div class="flex min-h-screen flex-col items-center justify-center">
        <p>Solid DEMO</p>
        <div class="p-8 flex flex-col gap-3 min-w-[25rem]">
          {...generateInputProps()}
          <button disabled={store.isSubmitting} onClick={store.submit} class="mt-12" >Submit</button>
        </div>
        <div class="max-w-[30rem]">
          {JSON.stringify(store.validations, null, 2)}
          <div class="my-5" />
          {JSON.stringify(store.modifications, null, 2)}
          <div />
          <p>isValid: {String(store.isValid)}</p>
          <p>isValidating: {String(store.isValidating)}</p>
          <p>isModified: {String(store.isModified)}</p>
          <p>isSubmitting: {String(store.isSubmitting)}</p>
          <button onClick={store.clear}>clear</button>
        </div>
      </div>
    </>
  );
}

export default App

function delayResult<T>(value: T, delay: number = 6000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}