import { Component } from "solid-js"
import { createForm } from "@formeus/solid"

const App: Component = () => {
  const store = createForm({
    initial: { name: "", email: "" },
    validators: {
      name: ({ name }) => {
        return name.length < 5 ? new Error("Too short") : undefined
      },
    },
    asyncValidators: {
      email: ({ email }) => {
        return Promise.resolve(undefined).then(delayResult)
      },
    },
    config: {
      autoValidate: true,
    },
  })

  return (
    <div>
      <p class="text-4xl text-green-700 text-center py-20">Hellooo</p>
      <div class="flex flex-col gap-2">
        <input
          class="border"
          placeholder="name..."
          value={store.values.name}
          onInput={(e) => {
            store.update("name", e.currentTarget.value)
          }}
        />
        <label>{store.validations.name.error?.message}</label>
        <input
          class="border"
          placeholder="email..."
          value={store.values.email}
          onInput={(e) => {
            store.update("email", e.currentTarget.value)
          }}
        />
        <label>{store.validations.email.error?.message}</label>

        <div>isValid: {store.isValid.toString()}</div>
        <div>isValidating: {store.isValidating.toString()}</div>
        <div>validations: {JSON.stringify(store.validations)}</div>
      </div>
    </div>
  )
}

export default App

function delayResult<T>(value: T, delay: number = 3000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, delay)
  })
}
