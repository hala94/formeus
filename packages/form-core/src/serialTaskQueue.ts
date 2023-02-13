import { Task } from "./task"

export type TaskState = {
  state: "idle" | "running" | "completed"
  success: boolean
  identifier: string
}

export function createSerialQueue() {
  let tasks = Array<Task>()
  let runningTask: { unsub: () => void; task: Task } | null = null

  // eslint-disable-next-line
  let onAllTasksCompleted = (_: { success: boolean }) => {
    return
  }

  function scheduleNextTask() {
    if (runningTask) return

    const nextTask = tasks[0]

    if (!nextTask) {
      onAllTasksCompleted({ success: true })
      onAllTasksCompleted = () => {
        return
      }
      return
    }

    runningTask = {
      unsub: nextTask.subscribe(taskStateHandler),
      task: nextTask,
    }

    nextTask.start()
  }

  function taskStateHandler(taskState: TaskState) {
    switch (taskState.state) {
      case "idle":
        break
      case "running":
        break
      case "completed":
        runningTask?.unsub()
        runningTask = null

        if (taskState.success) {
          tasks.shift()
          scheduleNextTask()
          return
        }

        tasks = []
        onAllTasksCompleted({ success: false })
        onAllTasksCompleted = () => {
          return
        }
    }
  }

  return {
    cancelAllTasks: () => {
      tasks = []
      runningTask?.unsub()
      runningTask?.task.cancel()
      runningTask = null
    },
    addTasks: (
      newTasks: Array<Task>,
      onCompleted: (result: { success: boolean }) => void
    ) => {
      onAllTasksCompleted = onCompleted
      tasks = newTasks
      scheduleNextTask()
    },
  }
}
