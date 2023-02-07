import { describe, it, expect, beforeEach, vi, SpyInstance } from "vitest"
import { TaskState } from "../serialTaskQueue"
import { createTask } from "../task"

type Context = {
  task: ReturnType<typeof createTask>
  testObject: {
    taskState: TaskState | undefined
    onCancelHandler: () => void
    workHandler: () => void
    identifier: string
  }
  workSpy: SpyInstance<[], void>
  cancelSpy: SpyInstance<[], void>
}

beforeEach<Context>(async (context) => {
  const testObject = {
    taskState: undefined as TaskState | undefined,
    onCancelHandler: () => {
      return
    },
    workHandler: () => {
      return
    },
    identifier: "TaskID",
  }

  const workSpy = vi.spyOn(testObject, "workHandler")
  const cancelSpy = vi.spyOn(testObject, "onCancelHandler")

  const taskSubscribable = createTask({
    onCancel: testObject.onCancelHandler,
    work: testObject.workHandler,
    identifier: testObject.identifier,
  })

  taskSubscribable.subscribe((newState) => {
    testObject.taskState = newState
  })

  context.task = taskSubscribable
  context.testObject = testObject
  context.workSpy = workSpy
  context.cancelSpy = cancelSpy
})

describe.concurrent("task", () => {
  it<Context>("is in correct state when started", ({
    task,
    testObject,
    workSpy,
  }) => {
    task.start()

    expect(workSpy).toHaveBeenCalledOnce()
    expect(testObject.taskState?.state).toBe("running")
  })

  it<Context>("in is correct state when cancelled", ({
    task,
    testObject,
    workSpy,
    cancelSpy,
  }) => {
    task.start()
    task.cancel()

    expect(workSpy).toHaveBeenCalledOnce()
    expect(cancelSpy).toHaveBeenCalledOnce()

    expect(testObject.taskState).toStrictEqual({
      success: false,
      state: "completed",
      identifier: testObject.identifier,
    })
  })

  it<Context>("is in correct state when finished", ({ task, testObject }) => {
    task.start()
    task.finish({ success: true })
    expect(testObject.taskState).toStrictEqual({
      success: true,
      state: "completed",
      identifier: testObject.identifier,
    })
  })
})
