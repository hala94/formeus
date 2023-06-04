import {
  FormOptions,
  createForm as createFormInternal,
  FormResult,
} from "@formeus/core"
import { onMount } from "svelte"
import { Readable, Unsubscriber, get, readable } from "svelte/store"
import { CreateFormOptions } from "./types"

export function createForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: CreateFormOptions<TForm, TMeta>): Readable<FormResult<TForm>> {
  const observable = createFormInternal(normalizeFormOptions(options))

  const store = readable(observable.getSnapshot(), (set) => {
    const unsubscribe = observable.subscribe((updated) => set(updated))

    return () => {
      unsubscribe()
    }
  })

  onMount(() => {
    let unsubInitial: Unsubscriber | undefined
    if (isStore(options.initial)) {
      unsubInitial = options.initial.subscribe((newInitial) => {
        observable.setInitial(newInitial)
      })
    }

    let unsubMeta: Unsubscriber | undefined
    if (options.meta && isStore(options.meta)) {
      unsubMeta = options.meta.subscribe((newMeta) => {
        observable.setMeta(newMeta)
      })
    }

    return () => {
      unsubInitial && unsubInitial()
      unsubMeta && unsubMeta()
    }
  })

  return store
}

function normalizeFormOptions<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: CreateFormOptions<TForm, TMeta>): FormOptions<TForm, TMeta> {
  return {
    ...options,
    initial: isStore(options.initial) ? get(options.initial) : options.initial,
    meta: isStore(options.meta) ? get(options.meta) : options.meta,
  }
}

function isStore<T>(value: T | Readable<T>): value is Readable<T> {
  if (!value) return false

  if (typeof value === "object" && value.hasOwnProperty("subscribe")) {
    return true
  }

  return false
}
