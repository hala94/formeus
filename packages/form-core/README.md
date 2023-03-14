# Formeus 🌀 Core

Formeus core library written in Javascript / Typescript.

Adapters for React, Vue, Solid and Svelte are available but the core
library can also be used.

# Installation

```
yarn add @formeus/core
npm install @formeus/core
pnpm add @formeus/core
```

# Key features

- designed to work with controlled components
- coordinated synchronous and asynchronous validations
- flexible validation times
- validation caching
- protected submit

# Example

```js
const formObservable = createForm({
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
        : new Error("1 uppercase, 1 lowercase, 1 number and at least 6 chars."),
  },
  asyncValidators: {
    username: ({ username }, signal) => {
      // username is already client side validated here
      return api
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

// Access methods that don't change
const { update } = formObservable.getSnapshot()

// Subscribe to updates
formObservable.subscribe((result) => {
  const { values, validations, isValid, isValidating } = result
  /// Use results
})
```
