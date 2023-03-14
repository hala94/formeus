# Formeus 🌀 React

Official React adapter for [Formeus](https://www.formeus.dev) library.

# Installation

```
yarn add @formeus/react
npm install @formeus/react
pnpm add @formeus/react
```

# Key features

- designed to work with controlled components
- coordinated synchronous and asynchronous validations
- flexible validation times
- validation caching
- protected submit

# Minimal Example in React

```js
import { useForm } from "@formeus/react"

function SignIn() {
  const { values, update } = useForm({
    initial: {
      username: "",
      password: "",
    },
  })

  return (
    <>
      <input
        value={values.username}
        onChange={(e) => update("username", e.target.value)}
      />
      <input
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
      />
      <button
        onClick={() => {
          api.signIn(values.username, values.password)
        }}
      >
        Submit
      </button>
    </>
  )
}
```

# Advanced Example in React

```js
import { useForm } from "@formeus/react"

function SignIn() {
  const { values, update, submit } = useForm({
    initial: {
      username: "",
      password: "",
    },
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
      api.signIn(username, password)
    },
  })

  return (
    <>
      <input
        value={values.username}
        onChange={(e) => update("username", e.target.value)}
      />
      <label>{validations.username.error?.message}</label>
      {validations.username.validating && <span>Loading...</span>}

      <input
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
      />
      <label>{validations.password.error?.message}</label>

      <button onClick={() => submit()}>Submit</button>
    </>
  )
}
```