<script lang="ts">
  import {
    createForm,
    type AsyncValidators,
    type Validators,
  } from "@formeus/svelte"
  import { onMount } from "svelte"
  import { writable } from "svelte/store"

  // Define the form structure
  type Form = {
    email: string
    password: string
    username: string
    project: string
  }

  const initialForm = writable({
    email: "",
    password: "",
    username: "",
    project: "",
  })

  function delayResult<T>(value: T, delay: number = 6000) {
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, delay)
    })
  }
  const validators: Validators<Form> = {
    email: ({ email }) => {
      return /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{5,})\S/.test(email)
        ? undefined
        : new Error("1 uppercase, 1 lowercase, 1 number and at least 6 chars.")
    },
    // email.length == 0 ? new Error("Email validation failed.") : undefined,
    password: ({ password }) =>
      password.length < 5 ? new Error("Enter at least 5 chars.") : undefined,
    username: ({ username }) =>
      username.length == 0
        ? new Error("Username validation failed.")
        : undefined,
  }

  const asyncValidators: AsyncValidators<Form> = {
    email: ({ email }) => {
      return Promise.resolve(undefined).then(delayResult)
    },
    username: ({ email }) => {
      return Promise.resolve(undefined).then(delayResult)
    },
  }

  const store = createForm({
    initial: initialForm,
    validators,
    asyncValidators,
    onSubmitForm: (values, meta, modified) => {
      console.log("SvelteDemo - onSubmitFormCalled -> ", values, meta, modified)
      return Promise.resolve(undefined)
        .then(delayResult)
        .then(() => {
          initialForm.update((old) => {
            return {
              ...old,
              ...modified,
            }
          })
        })
    },
  })

  onMount(() => {
    const timeout = setTimeout(() => {
      initialForm.update((old) => {
        return {
          email: "server!A@d.com",
          password: "12345",
          username: "loosername",
          project: "WHAT",
        }
      })
    }, 3000)
    return () => {
      clearTimeout(timeout)
    }
  })
</script>

<main>
  <h1>My Form</h1>

  <div class="form">
    <label for="email">Email:</label>
    <label for="email"
      >Error:{$store.validations.email.error?.message ?? ""}</label
    >
    <input
      id="email"
      value={$store.values.email}
      on:input={(event) => $store.update("email", event.currentTarget.value)}
    />
    <div>
      {JSON.stringify($store.validations.email) +
        JSON.stringify($store.modifications.email)}
    </div>

    <label for="password">Password:</label>
    <label for="password"
      >Error:{$store.validations.password.error?.message ?? ""}</label
    >
    <input
      id="password"
      value={$store.values.password}
      on:input={(event) => $store.update("password", event.currentTarget.value)}
    />
    <div>
      {JSON.stringify($store.validations.password) +
        JSON.stringify($store.modifications.password)}
    </div>

    <label for="username">Username:</label>
    <label for="username"
      >Error:{$store.validations.username.error?.message ?? ""}</label
    >
    <input
      id="username"
      value={$store.values.username}
      on:input={(event) => $store.update("username", event.currentTarget.value)}
    />
    <div>
      {JSON.stringify($store.validations.username) +
        JSON.stringify($store.modifications.username)}
    </div>

    <label for="project">Project:</label>
    <label for="project"
      >Error:{$store.validations.project.error?.message ?? ""}</label
    >
    <input
      id="project"
      value={$store.values.project}
      on:input={(event) => $store.update("project", event.currentTarget.value)}
    />
    <div>
      {JSON.stringify($store.validations.project) +
        JSON.stringify($store.modifications.project)}
    </div>

    <button on:click={$store.submit}>Submit</button>
    <button on:click={$store.clear}>Clear</button>

    <div>
      isValid: {$store.isValid}
    </div>
    <div>
      isValidating: {$store.isValidating}
    </div>
    <div>
      isSubmitting: {$store.isSubmitting}
    </div>
    <div>
      isModified: {$store.isModified}
    </div>
  </div>
</main>

<style>
  .form {
    margin-top: 1rem;
  }

  label {
    display: block;
    margin-top: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    margin-top: 1rem;
  }
</style>
