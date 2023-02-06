import { createTask } from "../../task"
import crypto from "crypto"

export function createDummyTask({
  finishAfterMs,
  success,
  resultSetter,
  onCancelHandler,
  identifier,
}: {
  finishAfterMs: number
  success: boolean
  resultSetter?: () => void
  onCancelHandler?: () => void
  identifier?: string
}) {
  let timeoutRef: NodeJS.Timeout | undefined

  const task = createTask({
    work,
    onCancel,
    identifier: identifier ?? crypto.randomUUID(),
  })

  function work() {
    timeoutRef = setTimeout(() => {
      resultSetter?.()
      task.finish({ success })
    }, finishAfterMs)
  }

  function onCancel() {
    onCancelHandler?.()
    timeoutRef && clearTimeout(timeoutRef)
  }
  return task
}
