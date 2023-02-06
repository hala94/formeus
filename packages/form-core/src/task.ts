import { TaskState } from "./serialTaskQueue"
import { createSubscribable } from "./subscribable"

type Props = {
  work: () => void
  onCancel: () => void
  identifier: string
}

export function createTask({ work, onCancel, identifier }: Props) {
  const subscribable = createSubscribable<TaskState>()

  let state: TaskState = { success: false, state: "idle", identifier }
  subscribable.publish(state)

  function dispatchState(newState: TaskState) {
    state = newState
    subscribable.publish(state)
  }
  return {
    ...subscribable,
    identifier,
    start: () => {
      dispatchState({ success: false, state: "running", identifier })
      work()
    },
    finish: ({ success }: { success: boolean }) => {
      dispatchState({ success, state: "completed", identifier })
    },
    cancel: () => {
      onCancel()
      dispatchState({ success: false, state: "completed", identifier })
    },
  }
}
