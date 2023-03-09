# Formeus 🌀

Formeus is a headless utility library for handling form input and validation.

It supports both synchronous and asynchronous validations and enables you to easily unify form behaviour and validation
across your application.

Formeus works with React, Solid, Vue and Svelte.

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
- protected submit


Dummy change

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
