import { FormOptions } from "@formeus/core"
import { useCallback } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"
import { useBaseForm } from "./useBaseForm"

export function useGranularForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>) {
  const subscribable = useBaseForm(options)

  // --- From field ---
  const useField = useCallback(
    (key: keyof TForm) => {
      if (!key || typeof key != "string") return () => {}

      return useSyncExternalStoreWithSelector(
        subscribable.subscribe,
        subscribable.getSnapshot,
        subscribable.getSnapshot,
        (snapshot) => {
          return {
            value: snapshot.values[key],
            validation: snapshot.validations[key],
            update: (value: TForm[typeof key]) => snapshot.update(key, value),
            runValidation: () => snapshot.runValidation(key),
          }
        },
        (a, b) => {
          return (
            a.value == b.value &&
            a.validation.checked == b.validation.checked &&
            a.validation.error == b.validation.error &&
            a.validation.validating == b.validation.validating
          )
        }
      )
    },
    [subscribable]
  )

  // --- Form controls ---
  const useFormControls = useCallback(() => {
    return useSyncExternalStoreWithSelector(
      subscribable.subscribe,
      subscribable.getSnapshot,
      subscribable.getSnapshot,
      (snapshot) => {
        return {
          clear: snapshot.clear,
          submit: snapshot.submit,
          runValidation: snapshot.runValidation,
          update: snapshot.update,
        }
      },
      () => true
    )
  }, [subscribable])

  // --- Form info ---
  const useFormInfo = useCallback(() => {
    return useSyncExternalStoreWithSelector(
      subscribable.subscribe,
      subscribable.getSnapshot,
      subscribable.getSnapshot,
      (snapshot) => {
        return {
          isValidating: snapshot.isValidating,
          isValid: snapshot.isValid,
          isSubmitting: snapshot.isSubmitting,
        }
      },
      (a, b) => {
        return (
          a.isValidating == b.isValidating &&
          a.isValid == b.isValid &&
          a.isSubmitting == b.isSubmitting
        )
      }
    )
  }, [subscribable])

  return {
    useField,
    useFormControls,
    useFormInfo,
  }
}

// type FieldState = {}

// type FormControls<TForm extends Record<string, unknown>> = Pick<
//   FormResult<TForm>,
//   "clear" | "isSubmitting" | "isValid" | "isValidating" | "submit"
// >
