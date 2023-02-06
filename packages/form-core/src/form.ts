import { getFormConfig } from "./formConfig"
import { createParallelQueue } from "./parallelTaskQueue"
import { createSerialQueue } from "./serialTaskQueue"
import { createSubscribable } from "./subscribable"
import {
  FormProps,
  FormResult,
  ValidationResults,
  ValidationState,
} from "./types"
import { createValidationTask } from "./validationTask"

export function createForm<TForm extends Record<string, unknown>>({
  config = getFormConfig(),
  ...props
}: FormProps<TForm>) {
  const subscribable = createSubscribable<FormResult<TForm>>()
  const parallelTaskQueue = createParallelQueue()
  const serialTaskQueue = createSerialQueue()

  let currentValues = props.initial
  let validations = createInitialValidations()

  let result: FormResult<TForm> = {
    values: currentValues,
    validations,
    update,
    runValidation,
    submit,
    isValid: isFormValid(validations),
    isValidating: isFormValidating(validations),
    clear: () => {
      currentValues = { ...props.initial }
      validations = createInitialValidations()
      pushResult()
    },
  }

  /// Public
  function update<Key extends keyof TForm>(key: Key, value: TForm[Key]) {
    currentValues = { ...currentValues, [key]: value }

    serialTaskQueue.cancelAllTasks()

    validations = invalidateValidation(key)

    pushResult()

    config?.autoValidate && runValidation(key)
  }

  function runValidation<Key extends keyof TForm>(key: Key) {
    parallelTaskQueue.cancelTask(key as string)

    const clientFN = props.validators && props.validators[key]
    const serverFN = props.asyncValidators && props.asyncValidators[key]

    if (!clientFN && !serverFN) return

    const task = createValidationTask({
      key: key as keyof TForm,
      form: currentValues,
      clientValidatorFN: clientFN,
      serverValidatorFN: serverFN,
      onValidationUpdate: (validationResult) => {
        validations = { ...validations, [key]: validationResult }
        pushResult()
      },
      existingResult: validations[key],
    })

    parallelTaskQueue.addTask(task)
  }

  function submit() {
    serialTaskQueue.cancelAllTasks()
    parallelTaskQueue.cancelAllTasks()

    const validationTasks = createValidationTasks()

    serialTaskQueue.addTasks(validationTasks, ({ success }) => {
      success && props.onSubmitForm?.(currentValues)
    })
  }

  /// Private

  function invalidateValidation(key: keyof TForm): ValidationResults<TForm> {
    let newValidations = { ...validations }

    const clientFN = props.validators && props.validators[key]
    const serverFN = props.asyncValidators && props.asyncValidators[key]

    if (clientFN || serverFN) {
      newValidations = {
        ...newValidations,
        [key]: {
          error: undefined,
          checked: false,
          validating: false,
        } as ValidationState,
      }
    }

    return newValidations
  }

  function createInitialValidations(): ValidationResults<TForm> {
    let initialValidations = {} as ValidationResults<TForm>

    for (const [key, _] of Object.entries(props.initial)) {
      const clientFN = props.validators && props.validators[key]
      const serverFN = props.asyncValidators && props.asyncValidators[key]

      const validation = {
        checked: !clientFN && !serverFN,
        error: undefined,
        validating: false,
      } as ValidationState

      initialValidations = { ...initialValidations, [key]: validation }
    }
    return initialValidations
  }

  function createValidationTasks() {
    return Object.keys(validations)
      .map((key) => {
        const clientFN = props.validators && props.validators[key]
        const serverFN = props.asyncValidators && props.asyncValidators[key]

        if (!clientFN && !serverFN) return

        return createValidationTask({
          key: key,
          form: currentValues,
          clientValidatorFN: clientFN,
          serverValidatorFN: serverFN,
          onValidationUpdate: (validationResult) => {
            validations = { ...validations, [key]: validationResult }
            pushResult()
          },
          existingResult: validations[key],
        })
      })
      .filter((t) => !!t !== false) as Array<
      ReturnType<typeof createValidationTask>
    >
  }

  function pushResult() {
    result = {
      ...result,
      values: currentValues,
      validations,
      isValid: isFormValid(validations),
      isValidating: isFormValidating(validations),
    }
    subscribable.publish(result)
  }

  return {
    ...subscribable,
    getSnapshot: () => result,
  }
}

/// Utility

function isFormValid<TForm>(validations: ValidationResults<TForm>) {
  return Object.values(validations).every((v) => {
    const validation = v as ValidationState
    return validation.checked && Boolean(validation.error) == false
  })
}

function isFormValidating<TForm>(validations: ValidationResults<TForm>) {
  return Object.values(validations).some((v) => {
    const validation = v as ValidationState
    return validation.validating == true
  })
}
