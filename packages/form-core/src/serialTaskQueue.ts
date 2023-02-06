import { createTask } from "./task"

type Task = ReturnType<typeof createTask>

export type TaskState = {
  state: "idle" | "running" | "completed"
  success: boolean
  identifier: string
}

export function createSerialQueue() {
  let tasks = Array<Task>()
  let runningTask: { unsub: () => void; task: Task } | null = null
  let pendingSchedule = false

  let onAllTasksCompleted = (_: { success: boolean }) => {}

  function queueScheduleTask() {
    if (pendingSchedule) return
    pendingSchedule = true

    queueMicrotask(() => {
      pendingSchedule = false
      scheduleNextTask()
    })
  }

  function scheduleNextTask() {
    if (runningTask) return

    const nextTask = tasks[0]

    if (!nextTask) {
      onAllTasksCompleted({ success: true })
      onAllTasksCompleted = () => {}
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
          queueScheduleTask()
          return
        }

        tasks = []
        onAllTasksCompleted({ success: false })
        onAllTasksCompleted = () => {}
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
      queueScheduleTask()
    },
  }
}
