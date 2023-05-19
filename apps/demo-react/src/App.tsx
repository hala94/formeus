import { Validators, AsyncValidators, useGranularForm } from "@formeus/react"
import { Input } from "./input"
import { Button } from "./button"
import { useEffect } from "react"

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
}

const asyncValidators: AsyncValidators<Form> = {
  email: ({ email }) => {
    return Promise.resolve(undefined).then(delayResult)
  },
}

export default function App() {
  const { useField, useFormControls } = useGranularForm({
    initial,
    onSubmitForm,
    validators,
    asyncValidators,
    config: { autoValidate: false, validateConcurrentlyOnSubmit: false },
  })

  const { clear } = useFormControls()

  function onSubmitForm(form: Form) {
    return Promise.resolve(false)
      .then(delayResult)
      .then(() => {
        clear()
      })
  }

  // function generateInputProps(): Array<InputProps> {
  //   return Object.keys(initial).map((key) => {
  //     const formKey = key as keyof Form
  //     return {
  //       label: key,
  //       value: values[formKey],
  //       validating: validations[formKey].validating,
  //       checked: validations[formKey].checked,
  //       error: validations[formKey].error?.message,
  //       disabled: isSubmitting,
  //       onChange: (e) => update(formKey, e.target.value),
  //     }
  //   })
  // }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>React DEMO</p>
        <div className="p-8 flex flex-col gap-3 min-w-[25rem]">
          {/* {...generateInputProps().map((inputProps) => (
            <Input {...inputProps} />
          ))} */}
          <FormInput useFormField={useField} id="email" />
          <FormInput useFormField={useField} id="password" />
          <FormControls useFormControls={useFormControls} />
        </div>
      </div>
    </>
  )
}

// TODO figure out easiest way to type
function FormInput({ useFormField, id }: { useFormField: any; id: string }) {
  const { value, validation, update } = useFormField(id)

  return (
    <>
      <Input
        label={id}
        value={value}
        validating={validation.validating}
        checked={validation.checked}
        error={validation.error?.message}
        onChange={(e) => update(e.target.value)}
      />
    </>
  )
}

// TODO figure out easiest way to type
function FormControls({ useFormControls }: { useFormControls: any }) {
  const { submit, isSubmitting } = useFormControls()

  return (
    <>
      <Button
        disabled={isSubmitting}
        onClick={() => submit()}
        className="mt-12"
      />
      {/* <div className="max-w-[30rem]">
        {JSON.stringify(validations, null, 2)}
        <p>isValid: {String(isValid)}</p>
      </div> */}
    </>
  )
}

function delayResult<T>(value: T, delay: number = 3000) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, delay)
  })
}
