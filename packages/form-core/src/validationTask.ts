import { createTask } from "./task"
import {
  Validator,
  AsyncValidator,
  ValidationState,
  ValidationResult,
} from "./types"

type ValidationTaskProps<
  TForm,
  TMeta extends Record<string, unknown> = Record<string, unknown>
> = {
  key: keyof TForm
  form: TForm
  clientValidatorFN: Validator<TForm, TMeta> | undefined
  serverValidatorFN: AsyncValidator<TForm, TMeta> | undefined
  onValidationUpdate: (result: ValidationState) => void
  existingResult: ValidationState
  getMeta: () => TMeta
}

export function createValidationTask<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown>
>({
  key,
  form,
  onValidationUpdate,
  clientValidatorFN,
  serverValidatorFN,
  existingResult,
  getMeta: contextGetter,
}: ValidationTaskProps<TForm, TMeta>) {
  const abortController = new AbortController()
  const task = createTask({ work, onCancel, identifier: key as string })

  function work() {
    if (!clientValidatorFN && !serverValidatorFN) {
      task.finish({ success: true })
      return
    }

    if (existingResult.checked) {
      task.finish({ success: Boolean(existingResult.error) == false })
      return
    }

    if (clientValidatorFN) {
      let clientVResult: ValidationResult
      let error: unknown

      try {
        clientVResult = clientValidatorFN(form, contextGetter())
        if (clientVResult && !(clientVResult instanceof Error)) {
          clientVResult = undefined
        }
      } catch (e) {
        error = e
      }

      onValidationUpdate({
        error: error
          ? error instanceof Error
            ? error
            : new Error()
          : clientVResult,
        checked: true,
        validating: false,
      })

      if (clientVResult) {
        task.finish({ success: false })
        return
      }
    }

    if (!serverValidatorFN) {
      task.finish({ success: true })
      return
    }

    onValidationUpdate({
      error: undefined,
      checked: false,
      validating: true,
    })

    serverValidatorFN(form, abortController.signal, contextGetter())
      .then((serverVResult) => {
        if (abortController.signal.aborted) return

        let finalResult = serverVResult

        if (finalResult && !(finalResult instanceof Error)) {
          finalResult = undefined
        }
        onValidationUpdate({
          error: finalResult,
          checked: true,
          validating: false,
        })

        task.finish({ success: Boolean(serverVResult) == false })
      })
      .catch((e) => {
        if (abortController.signal.aborted) return

        onValidationUpdate({
          error: e instanceof Error ? e : new Error(),
          checked: true,
          validating: false,
        })

        task.finish({ success: false })
      })
  }

  function onCancel() {
    abortController.abort()
    onValidationUpdate({
      error: undefined,
      checked: false,
      validating: false,
    })
  }

  return task
}
