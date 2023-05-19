import { useCallback, useEffect, useMemo, useState } from "react"
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector"

import { createForm, FormOptions, FormResult } from "@formeus/core"

export function useForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>) {
  const [subscribable] = useState(() => createForm(options))

  useEffect(() => {
    options.meta && subscribable.setMeta(options.meta)
  }, [options.meta, subscribable])

  return useSyncExternalStore(
    subscribable.subscribe,
    subscribable.getSnapshot,
    subscribable.getSnapshot
  )
}

export function useGranularForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: FormOptions<TForm, TMeta>) {
  const [subscribable] = useState(() => createForm(options))

  useEffect(() => {
    options.meta && subscribable.setMeta(options.meta)
  }, [options.meta, subscribable])

  // --- Enable fine grained field state ---
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
  // --- Enable fine grained field state ---

  // --- Enable fine grained formControl state ---
  const useFormControls = useCallback(() => {
    return useSyncExternalStoreWithSelector(
      subscribable.subscribe,
      subscribable.getSnapshot,
      subscribable.getSnapshot,
      (snapshot) => {
        return {
          clear: snapshot.clear,
          submit: snapshot.submit,
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
  // --- Enable fine grained formControl state ---

  return useMemo(() => {
    return {
      useField,
      useFormControls,
    }
  }, [useField, useFormControls])
}
