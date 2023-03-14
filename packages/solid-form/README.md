# Formeus 🌀 Solid

Official Solid adapter for [Formeus](https://www.formeus.dev) library.

# Installation

```
yarn add @formeus/solid
npm install @formeus/solid
pnpm add @formeus/solid
```

# Key features

- designed to work with controlled components
- coordinated synchronous and asynchronous validations
- flexible validation times
- validation caching
- protected submit

# Minimal Example in Solid

```js
import { createForm } from "@formeus/solid"

const SignIn: Component = () => {
  const form = createForm({
    initial: { username: "", password: "" },
  })

  function onSubmit() {
    api.signIn(form.values.username, form.values.password)
  }

  return (
    <>
      <input
        value={form.values.username}
        onInput={(e) => {
          form.update("username", e.currentTarget.value)
        }}
      />
 
      <input
        value={form.values.password}
        onInput={(e) => {
          form.update("password", e.currentTarget.value)
        }}
      />
      {/*form.validations.password.checked */}
      {/*form.validations.password.validating */}
      <button onClick={() => onSumbit()}>Submit</button>
    </>
  )
}
```

# Advanced Example in Solid

```js
import { createForm } from "@formeus/solid"

const SignIn: Component = () => {
  const form = createForm({
    initial: { username: "", password: "" },
    validators: {
      username: ({ username }) =>
        username.length == 0
          ? new Error("Must contain at least 1 char.")
          : undefined,
      password: ({ password }) =>
        /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{5,})\S/.test(password)
          ? undefined
          : new Error(
              "1 uppercase, 1 lowercase, 1 number and at least 6 chars."
            ),
    },
    asyncValidators: {
      username: ({ username }, signal) => {
        // username is already client side validated here
        api
          .checkUsernameAvailable(username, signal)
          .then((isAvailable) =>
            isAvailable ? undefined : new Error("username not available")
          )
      },
    },
    onSubmitForm: ({ username, password }) => {
      /// this scope guarantees all fields passed validations
      api.signIn(username, password)
    },
  })

  return (
    <>
      <input
        value={form.values.username}
        onInput={(e) => {
          form.update("username", e.currentTarget.value)
        }}
      />
      <input
        value={form.values.password}
        onInput={(e) => {
          form.update("password", e.currentTarget.value)
        }}
      />
      <button onClick={() => form.submit()}>Submit</button>
    </>
  )
}
```