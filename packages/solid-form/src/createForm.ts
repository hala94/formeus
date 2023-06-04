import { createForm as createFormCore, FormResult } from "@formeus/core"
import type { FormOptions } from "@formeus/core"
import { createStore } from "solid-js/store"
import { Accessor, createEffect, onCleanup } from "solid-js"
import { CreateFormOptions } from "./types"

export function createForm<
  TForm extends Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>
>(options: CreateFormOptions<TForm, TMeta>): FormResult<TForm> {
  const observable = createFormCore(normalizeFormOptions(options))

  const [store, setStore] = createStore(observable.getSnapshot())

  const unsubscribe = observable.subscribe(setStore)

  onCleanup(unsubscribe)

  createEffect(() => {
    if (isAccessor(options.initial)) {
      observable.setInitial(options.initial())
    }
    if (isAccessor(options.meta)) {
      observable.setMeta(options.meta())
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
    initial: isAccessor(options.initial) ? options.initial() : options.initial,
    meta: isAccessor(options.meta) ? options.meta() : options.meta,
  }
}

function isAccessor<T>(value: T | Accessor<T>): value is Accessor<T> {
  if (!value) return false
  if (typeof value === "function") return true
  return false
}
