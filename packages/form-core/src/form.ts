import { getFormConfig } from "./formConfig"
import { createParallelQueue } from "./parallelTaskQueue"
import { createSerialQueue } from "./serialTaskQueue"
import { createSubscribable } from "./subscribable"
import {
  FormOptions,
  FormResult,
  ValidationResults,
  ValidationState,
} from "./types"
import { createValidationTask } from "./validationTask"

export function createForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>) {
  const config = options.config
    ? { ...getFormConfig(), ...options.config }
    : getFormConfig()

  const subscribable = createSubscribable<FormResult<TForm>>()

  const taskValidationQueue = createParallelQueue()
  const submitQueue = createSubmitQueue({
    concurrently: config?.validateConcurrentlyOnSubmit || false,
  })

  let currentValues = options.initial
  let validations = createInitialValidations()
  let meta = (options.meta ?? {}) as TMeta
  let isSubmitting = false

  let result: FormResult<TForm> = {
    values: currentValues,
    validations,
    update,
    runValidation,
    submit,
    isValid: isFormValid(validations),
    isValidating: isFormValidating(validations),
    clear: () => {
      currentValues = { ...options.initial }
      validations = createInitialValidations()
      pushResult()
    },
    isSubmitting,
  }

  /// Public
  function update<Key extends keyof TForm>(key: Key, value: TForm[Key]) {
    currentValues = { ...currentValues, [key]: value }

    submitQueue.cancelAllTasks()

    validations = invalidateValidation(key)

    pushResult()

    config?.autoValidate && runValidation(key)
  }

  function runValidation<Key extends keyof TForm>(key: Key) {
    taskValidationQueue.cancelTask(key as string)

    const clientFN = options.validators && options.validators[key]
    const serverFN = options.asyncValidators && options.asyncValidators[key]

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
      getMeta: () => meta,
    })

    taskValidationQueue.addTask(task)
  }

  function submit() {
    if (!options.onSubmitForm) return

    taskValidationQueue.cancelAllTasks()

    submitQueue.cancelAllTasks()

    const validationTasks = createValidationTasks()

    submitQueue.addTasks(validationTasks, async ({ success }) => {
      if (!success) return

      const result = options.onSubmitForm?.(currentValues, meta)

      if (!result) return

      if (typeof result.then !== "function") return

      isSubmitting = true
      pushResult()

      result.finally(() => {
        isSubmitting = false
        pushResult()
      })
    })
  }

  /// Private

  function invalidateValidation(key: keyof TForm): ValidationResults<TForm> {
    let newValidations = { ...validations }

    const clientFN = options.validators && options.validators[key]
    const serverFN = options.asyncValidators && options.asyncValidators[key]

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

    for (const [key] of Object.entries(options.initial)) {
      const clientFN = options.validators && options.validators[key]
      const serverFN = options.asyncValidators && options.asyncValidators[key]

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
        const clientFN = options.validators && options.validators[key]
        const serverFN = options.asyncValidators && options.asyncValidators[key]

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
          getMeta: () => meta,
        })
      })
      .filter((t) => !!t !== false) as Array<
      ReturnType<typeof createValidationTask>
    >
  }

  function setMeta(newMeta: TMeta) {
    if (newMeta) {
      meta = newMeta
    }
  }

  function pushResult() {
    result = {
      ...result,
      values: currentValues,
      validations,
      isValid: isFormValid(validations),
      isValidating: isFormValidating(validations),
      isSubmitting,
    }
    subscribable.publish(result)
  }

  return {
    ...subscribable,
    getSnapshot: () => result,
    setMeta,
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

function createSubmitQueue({ concurrently }: { concurrently: boolean }) {
  const serialQueue = createSerialQueue()
  const parallelQueue = createParallelQueue()

  return {
    addTasks: concurrently ? parallelQueue.addTasks : serialQueue.addTasks,
    cancelAllTasks: concurrently
      ? parallelQueue.cancelAllTasks
      : serialQueue.cancelAllTasks,
  }
}
