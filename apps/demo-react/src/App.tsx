import { Validators, AsyncValidators, useGranularForm } from "@formeus/react"
import { Input, InputProps } from "./input"
import { Button } from "./button"


// consider spreading useFormControls to just functions, and create another useFormMeta for constantly chaning values

// there is a viisble delay when using many fields and pressing validate, tasks are being added to a queue and something blocks


const initialValues = Array.from(Array(1000).keys()).reduce((prev, current) => {
  return {
    ...prev,
    [`${current}field`]: "",
  }
}, {}) as Record<string, string>

// const validators: Validators<Form> = {
//   email: ({ email }) =>
//     /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{5,})\S/.test(email)
//       ? undefined
//       : new Error("1 uppercase, 1 lowercase, 1 number and at least 6 chars."),
//   // email.length == 0 ? new Error("Email validation failed.") : undefined,
//   password: ({ password }) =>
//     password.length < 5 ? new Error("Enter at least 5 chars.") : undefined,
// }

const asyncValidators: AsyncValidators<typeof initialValues> = Object.keys(
  initialValues
).reduce((prev, current) => {
  return {
    ...prev,
    [current]: (values: Record<string, string>) => {
      return Promise.resolve(undefined)
    },
  }
}, {})

export default function App() {
  const { useField, useFormControls } = useGranularForm({
    initial: initialValues,
    onSubmitForm,
    asyncValidators,
    config: { autoValidate: false, validateConcurrentlyOnSubmit: false },
  })

  const { clear } = useFormControls()

  function onSubmitForm(form: any) {
    return Promise.resolve(false)
      .then(delayResult)
      .then(() => {
        clear()
      })
  }

  // function generateInputProps(): Array<InputProps> {
  //   return Object.keys(initialValues).map((key) => {
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
          <FormControls useFormControls={useFormControls} />
          <div className="flex flex-col border max-h-screen overflow-auto p-8">
            {Object.keys(initialValues).map((id) => (
              <FormInput useFormField={useField} id={id} />
            ))}
          </div>
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
