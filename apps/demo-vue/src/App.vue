<template>
  <div class="wrap">
    <p>Vue DEMO</p>
    <div class="fieldsWrapp">
    
      <div class="field">
      <label>Email</label>
      <input :value="store.values.value.email"  @input="(e) => store.update.value('email', (e.target as HTMLInputElement).value)" />
      <div>{{store.validations.value.email}}</div>
      </div>

      <div class="field">
      <label>Username</label>
      <input :value="store.values.value.username"  @input="(e) => store.update.value('username', (e.target as HTMLInputElement).value)" />
      <div>{{store.validations.value.username}}</div>
      </div>

      <div class="field">
      <label>Password</label>
      <input :value="store.values.value.password"  @input="(e) => store.update.value('password', (e.target as HTMLInputElement).value)" />
      <div>{{store.validations.value.password}}</div>
      </div>

      <div class="field">
      <label>Project</label>
      <input :value="store.values.value.project"  @input="(e) => store.update.value('project', (e.target as HTMLInputElement).value)" />
      <div>{{store.validations.value.project}}</div>
       </div>

      <button :disabled="store.isSubmitting.value" @click="store.submit.value">
        Submit
      </button>
    </div>
    <div class="max-w-[30rem]">
      <p>isValid: {{ String(store.isValid.value) }}</p>
      <p>isValidating: {{ String(store.isValidating.value) }}</p>
      <p>isModified: {{ String(store.isModified.value) }}</p>
      <p>isSubmitting: {{ String(store.isSubmitting.value) }}</p>
      <button @click="store.clear">clear</button>
    </div>
  </div>
</template>

<script lang="ts">

import { onMounted, onUnmounted, ref } from 'vue'
import { useForm, type AsyncValidators, type Validators } from '@formeus/vue'

export default {
  name: 'App',
  setup() {


    type Form = {
    email: string
    password: string
    username: string
    project: string
    }

    const initial = ref({
      // Define your initial form values here
      email: "",
      password: "",
      username: "",
      project: "",
    })

    const validators: Validators<Form> = {
      email: ({ email }) =>
        /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{5,})\S/.test(email)
          ? undefined
          : new Error('1 uppercase, 1 lowercase, 1 number and at least 6 chars.'),
      password: ({ password }) =>
        password.length < 5 ? new Error('Enter at least 5 chars.') : undefined,
      username: ({ username }) =>
        username.length == 0 ? new Error('Username validation failed.') : undefined,
    }

    const asyncValidators: AsyncValidators<Form> = {
      email: ({ email }) => {
        return Promise.resolve(undefined).then(delayResult)
      },
      username: ({ email }) => {
        return Promise.resolve(undefined).then(delayResult)
      },
    }

    const store = useForm({
      initial: initial,
      onSubmitForm: (latest, meta, modified) => {
        console.log('on submit reported modified fields, ', JSON.stringify(modified))
      },
      validators,
      asyncValidators,
      comparators: {
        email: (newValue, oldValue) => {
          return newValue.length === oldValue.length
        },
      },
      config: { autoValidate: false, validateConcurrentlyOnSubmit: false },
    })

    function delayResult<T>(value: T, delay = 6000) {
      return new Promise<T>((resolve) => {
        setTimeout(() => {
          resolve(value)
        }, delay)
      })
    }

    onMounted(() => {
      console.log("on mount")

      const timeout = setTimeout(() => {
        // Change the value of initial after a delay
        console.log("timeout firing initial ref set to new value")

        initial.value = {
          email: "new@email.com",
          password: "newpassword",
          username: "newusername",
          project: "newproject",
        }
      }, 3000)

      onUnmounted(() => {
    clearTimeout(timeout)
  })
    })


    return {
      initial,
      store,
    }
  },
}
</script>


<style scoped>



.fieldsWrapp {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

</style>
