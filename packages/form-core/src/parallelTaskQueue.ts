import { TaskState } from "./serialTaskQueue"
import { Task } from "./task"

export function createParallelQueue() {
  let aggregatedTaskState = Array<TaskState>()

  const runningTasks = new Map<string, { task: Task; unsub: () => void }>()

  // eslint-disable-next-line
  let onAllTasksCompleted = (_: { success: boolean }) => {
    return
  }

  function scheduleTasks(tasks: Array<Task>) {
    if (tasks.length === 0) return
    aggregatedTaskState = []

    tasks.forEach((task) => {
      const unsub = task.subscribe(taskStateHandler)
      runningTasks.set(task.identifier, {
        task,
        unsub,
      })
    })

    // update runningTasks before starting
    tasks.forEach((task) => {
      task.start()
    })
  }

  function taskStateHandler(taskState: TaskState) {
    switch (taskState.state) {
      case "idle":
        break
      case "running":
        break
      case "completed": {
        aggregatedTaskState.push(taskState)

        const job = runningTasks.get(taskState.identifier)
        job?.unsub()
        runningTasks.delete(taskState.identifier)

        if (runningTasks.size == 0) {
          onAllTasksCompleted({
            success: aggregatedTaskState.every(
              (state) => state.success == true
            ),
          })
          onAllTasksCompleted = () => {
            return
          }
        }
      }
    }
  }

  return {
    cancelTask: (identifier: string) => {
      const job = runningTasks.get(identifier)
      job?.unsub()
      job?.task.cancel()
      runningTasks.delete(identifier)
    },
    cancelAllTasks: () => {
      runningTasks.forEach((job) => {
        job?.unsub()
        job?.task.cancel()
      })
      runningTasks.clear()
    },
    addTask: (task: Task) => {
      scheduleTasks([task])
    },
    addTasks: (
      newTasks: Array<Task>,
      onCompleted: (result: { success: boolean }) => void
    ) => {
      onAllTasksCompleted = onCompleted
      scheduleTasks(newTasks)
    },
  }
}
