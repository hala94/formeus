# Formeus 🌀 Vue

Official Vue adapter for [Formeus](https://www.formeus.dev) library.

# Installation

```
yarn add @formeus/vue
npm install @formeus/vue
pnpm add @formeus/vue
```

# Key features

- designed to work with controlled components
- coordinated synchronous and asynchronous validations
- flexible validation times
- validation caching
- protected submit

# Minimal Example in Vue

```js
<script setup lang="ts">
import { useForm } from "@formeus/vue"

const { values, update } = useForm({
  initial: {
    username: "",
    password: "",
  },
})

function onSubmit() {
    api.signIn(values.username, value.password)
}
</script>

<template>
  <input
    :value="values.username"
    @input="(e) => update('username', (e.target as HTMLInputElement).value)"
  />
  <input
    :value="values.password"
    @input="(e) => update('password', (e.target as HTMLInputElement).value)"
  />
  <button @click="onSubmit">Submit</button>
</template>
```

# Advanced Example in Vue

```js
<script setup lang="ts">
import { useForm } from "@formeus/vue"

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

function onSubmit() {
  submit.value()
}
</script>

<template>
  <input
    :value="values.username"
    @input="(e) => update('username', (e.target as HTMLInputElement).value)"
  />
  <input
    :value="values.password"
    @input="(e) => update('password', (e.target as HTMLInputElement).value)"
  />
  <button @click="onSubmit">Submit</button>
</template>
```
