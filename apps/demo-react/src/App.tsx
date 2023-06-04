import { useForm, Validators, AsyncValidators } from "@formeus/react"
import { useCallback, useEffect, useState } from "react"
import { Input, InputProps } from "./input"
import { Button } from "./button"

type Form = {
  email: string
  password: string
  username: string
  project: string
}

const initial: Form = {
  email: "",
  password: "",
  username: "",
  project: "",
}

const validators: Validators<Form> = {
  email: ({ email }) =>
    /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{5,})\S/.test(email)
      ? undefined
      : new Error("1 uppercase, 1 lowercase, 1 number and at least 6 chars."),
  // email.length == 0 ? new Error("Email validation failed.") : undefined,
  password: ({ password }) =>
    password.length < 5 ? new Error("Enter at least 5 chars.") : undefined,
  username: ({ username }) =>
    username.length == 0 ? new Error("Username validation failed.") : undefined,
}

const asyncValidators: AsyncValidators<Form> = {
  email: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult)
  },
  username: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult)
  },
}

export default function App() {

  /// Mock more realistic app re-rendering state
  useEverChangingValue()

  const { serverForm, updateServerForm } = useServerFormValues(initial)
  
  const {
    values,
    validations,
    update,
    isValid,
    submit,
    isValidating,
    isModified,
    modifications,
    clear,
    isSubmitting,
  } = useForm({
    initial: serverForm,
    onSubmitForm: (latest, meta, modified) => {
      console.log("on sumbit reported modified fields, ", JSON.stringify(modified))
      return updateServerForm(latest)
    },
    validators,
    asyncValidators,
    comparators: {
      email: (newValue, oldValue) => {
        return newValue.length == oldValue.length
      }
    },
    config: { autoValidate: false, validateConcurrentlyOnSubmit: false },
  })

  function generateInputProps(): Array<InputProps> {
    return Object.keys(initial).map((key) => {
      const formKey = key as keyof Form
      return {
        label: key,
        value: values[formKey],
        validating: validations[formKey].validating,
        checked: validations[formKey].checked,
        error: validations[formKey].error?.message,
        disabled: isSubmitting,
        onChange: (e) => update(formKey, e.target.value),
      }
    })
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>React DEMO</p>
        <div className="p-8 flex flex-col gap-3 min-w-[25rem]">
          {...generateInputProps().map((inputProps) => (
            <Input {...inputProps} />
          ))}
          <Button
            disabled={isSubmitting}
            onClick={() => submit()}
            className="mt-12"
          />
        </div>
        <div className="max-w-[30rem]">
          {JSON.stringify(validations, null, 2)}
          <div className="my-5"/>
          {JSON.stringify(modifications, null, 2)}
          <div />
          <p>isValid: {String(isValid)}</p>
          <p>isValidating: {String(isValidating)}</p>
          <p>isModified: {String(isModified)}</p>
          <p>isSubmitting: {String(isSubmitting)}</p>
          <button onClick={() => clear()}>clear</button>
        </div>
      </div>
    </>
  )
}

function delayResult<T>(value: T, delay: number = 6000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, delay)
  })
}


function useServerFormValues(initial: Form) {

  const [serverForm, setServerForm] = useState<Form>(initial)

  const updateServerForm = useCallback((newForm: Form) => {

    return Promise.resolve(undefined).then(delayResult).then(() => {
      setServerForm(old => {
        return {
          ...old,
          ...newForm
        }
      })
    })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setServerForm({
        email: "server@mail.com",
        username: "loosername",
        password: "123",
        project: "WHAT"
      })
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return {serverForm, updateServerForm}

}

function useEverChangingValue() {

  const [count, setCount] = useState(0)

  useEffect(() => {

    const timeout = setTimeout(() => {
      setCount(c => c + 1)
    }, 3000)

    return () => {
      clearTimeout(timeout)
    }
  })

  return count
}