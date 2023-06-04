# Formeus 🌀

Formeus is a headless utility library for handling form input and validation.

It supports both synchronous and asynchronous validations and enables you to easily unify form behaviour and validation
across your application.

Formeus has adapters for React, Solid, Vue and Svelte.

## Visit the [official docs](https://www.formeus.dev)

# Installation

```
// React
yarn add @formeus/react
npm install @formeus/react
pnpm add @formeus/react

// Solid
yarn add @formeus/solid
npm install @formeus/solid
pnpm add @formeus/solid

// Vue
yarn add @formeus/vue
npm install @formeus/vue
pnpm add @formeus/vue

// Svelte
yarn add @formeus/svelte
npm install @formeus/svelte
pnpm add @formeus/svelte
```

# Key features

- designed to work with controlled components
- coordinated synchronous and asynchronous validations
- flexible validation times
- validation caching
- modification tracking
- protected submit
- submit only modified fields

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

# Configurations

To set a global configuration use the below method:

```js
import { setFormConfig } from "@formeus/react"
```

Configuration object is of type:

```js
type FormConfig = {
  autoValidate?: boolean,
  validateConcurrentlyOnSubmit?: boolean,
}
```

Every _form instance_ in your application will inherit the global configuration, but that configuration can be overrided
for each particular _instance_.

---

Visit the official [docs](https://www.formeus.dev) to learn about different configurations and get the most out of the library.
