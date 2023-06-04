import { getFormConfig } from "./formConfig"
import { createParallelQueue } from "./parallelTaskQueue"
import { createSerialQueue } from "./serialTaskQueue"
import { createSubscribable } from "./subscribable"
import {
  FormOptions,
  FormResult,
  ModificationResults,
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

  let initialValues = { ...options.initial }
  let currentValues = { ...initialValues }
  let validations = createInitialValidations()
  let modifications = createInitialModifications()
  let meta = (options.meta ?? {}) as TMeta
  let isSubmitting = false

  let result: FormResult<TForm> = {
    values: currentValues,
    validations,
    modifications,
    update,
    runValidation,
    submit,
    isValid: isFormValid(validations),
    isValidating: isFormValidating(validations),
    isModified: isFormModified(modifications),
    clear: clearForm,
    isSubmitting,
  }

  /// Public
  function update<Key extends keyof TForm>(key: Key, value: TForm[Key]) {
    currentValues = { ...currentValues, [key]: value }

    submitQueue.cancelAllTasks()

    validations = invalidateValidation(key)

    modifications = {
      ...modifications,
      [key]: {
        isModified: determineIsModified(currentValues, initialValues, key),
      },
    }

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
        validations = {
          ...validations,
          [key]: validationResult,
        }
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

      const modifiedOnlyForm = {} as Partial<TForm>
      Object.keys(currentValues).forEach((key) => {
        if (modifications[key].isModified) {
          modifiedOnlyForm[key as keyof TForm] =
            currentValues[key as keyof TForm]
        }
      })

      const result = options.onSubmitForm?.(
        currentValues,
        meta,
        modifiedOnlyForm
      )

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

  function determineIsModified(left: TForm, right: TForm, key: keyof TForm) {
    const comparatorFN = options.comparators?.[key]

    if (comparatorFN) {
      return comparatorFN(left[key], right[key]) === false
    } else {
      return deepEqual(left[key], right[key]) === false
    }
  }

  function isFormTypeEqual(left: TForm, right: TForm) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    if (leftKeys.sort().toString() !== rightKeys.sort().toString()) {
      return false
    }

    const someModified = leftKeys.some((key) => {
      const formKey = key as keyof TForm
      return determineIsModified(left, right, formKey)
    })

    if (someModified) {
      return false
    }

    return true
  }

  function createInitialValidations(): ValidationResults<TForm> {
    let initialValidations = {} as ValidationResults<TForm>

    for (const [key] of Object.entries(initialValues)) {
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

  function createInitialModifications(): ModificationResults<TForm> {
    let initialModifications = {} as ModificationResults<TForm>

    for (const [key] of Object.entries(initialValues)) {
      const modificationState = {
        isModified: false,
      }
      initialModifications = {
        ...initialModifications,
        [key]: modificationState,
      }
    }
    return initialModifications
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
            validations = {
              ...validations,
              [key]: validationResult,
            }
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
      meta = { ...newMeta }
    }
  }

  function setInitial(newInitial: TForm) {
    if (!newInitial) return

    if (isFormTypeEqual(initialValues, newInitial)) {
      return
    }

    /// Update to new default values
    initialValues = { ...newInitial }

    /// Extract previously modified fields prior to modification object update
    const unmodifiedFieldKeys: Array<keyof TForm> = []

    Object.keys(modifications).forEach((key: keyof TForm) => {
      if (modifications[key].isModified == false) {
        unmodifiedFieldKeys.push(key)
      }
    })

    const updatedValuesForUnmodifiedFieldKeys = unmodifiedFieldKeys.reduce(
      (prev, current) => {
        return {
          ...prev,
          [current]: newInitial[current],
        }
      },
      {} as Partial<Record<keyof TForm, TForm[keyof TForm]>>
    )

    /// TODO - FLAG - syncs initial values to current values

    if (isFormValidating(validations) == false && isSubmitting == false) {
      /// Update current values for unmodified fields
      currentValues = {
        ...currentValues,
        ...updatedValuesForUnmodifiedFieldKeys,
      }

      /// Invalidate updated fields
      Object.keys(updatedValuesForUnmodifiedFieldKeys).forEach(
        (key: keyof TForm) => {
          invalidateValidation(key)
        }
      )
    }

    /// Update modifications according to new default values
    Object.keys(modifications).forEach((key: keyof TForm) => {
      modifications = {
        ...modifications,
        [key]: {
          isModified: determineIsModified(currentValues, initialValues, key),
        },
      }
    })

    pushResult()
  }

  function clearForm() {
    currentValues = { ...initialValues }
    validations = createInitialValidations()
    modifications = createInitialModifications()
    pushResult()
  }

  function pushResult() {
    result = {
      ...result,
      values: currentValues,
      validations,
      modifications,
      isValid: isFormValid(validations),
      isValidating: isFormValidating(validations),
      isModified: isFormModified(modifications),
      isSubmitting,
    }
    subscribable.publish(result)
  }

  return {
    ...subscribable,
    getSnapshot: () => result,
    setMeta,
    setInitial,
  }
}

/// Utility

function isFormValid<TForm>(validations: ValidationResults<TForm>) {
  return Object.values(validations).every((v) => {
    const validation = v as ValidationState
    return validation.checked && Boolean(validation.error) == false
  })
}

function isFormModified<TForm>(modifications: ModificationResults<TForm>) {
  return Object.values(modifications).some((v) => {
    const modification = v as { isModified: boolean }
    return modification.isModified == true
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

function deepEqual(obj1: unknown, obj2: unknown) {
  if (typeof obj1 !== typeof obj2) {
    // Not equal if not the same type
    return false
  }

  if (typeof obj1 !== "object") {
    // Return strict equality for non objects
    return obj1 === obj2
  }

  if (!obj1 || !obj2) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  const firstUnEqualElement = keys1.find((key) => {
    return (
      deepEqual(
        obj1[key as keyof typeof obj1],
        obj2[key as keyof typeof obj2]
      ) === false
    )
  })

  if (firstUnEqualElement) {
    return false
  }

  return true
}
