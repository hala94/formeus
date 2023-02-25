<script setup lang="ts">
import { useForm } from "@formeus/vue"

const { values, update, isValid, isValidating, validations } = useForm({
  initial: {
    username: "",
    password: "",
  },
  validators: {
    username: ({ username }) =>
      username.length > 5 ? undefined : new Error("too short"),
    password: ({ password }) =>
      password.length > 5 ? undefined : new Error("too short"),
  },
  asyncValidators: {
    username: ({ username }) =>
      Promise.resolve(undefined).then(
        (e) =>
          new Promise((res, _) => {
            setTimeout(() => {
              res(e)
            }, 3000)
          })
      ),
  },
  config: {
    autoValidate: true,
  },
})
</script>

<template>
  <div>
    <div
      style="
        display: flex;
        flex-direction: column;
        gap: 2rem;
        margin-bottom: 2rem;
      "
    >
      <input
        :value="values.username"
        @input="(e) => update('username', (e.target as HTMLInputElement).value)"
      />
      <label>{{ validations.username.error?.message }}</label>
      <input
        :value="values.password"
        @input="(e) => update('password', (e.target as HTMLInputElement).value)"
      />
      <label>{{ validations.password.error?.message }}</label>
    </div>
    <div>{{ validations }}</div>
    <div>Is valid: {{ isValid }}</div>
    <div>Is validating: {{ isValidating }}</div>
  </div>
</template>
