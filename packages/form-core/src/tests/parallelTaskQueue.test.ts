import { describe, it, expect, beforeEach } from "vitest"
import { createParallelQueue } from "../parallelTaskQueue"
import { createDummyTask } from "./utils/createDummyTask"

type Context = {
  queue: ReturnType<typeof createParallelQueue>
}

beforeEach<Context>(async (context) => {
  context.queue = createParallelQueue()
})

describe.concurrent("parallelQueue", () => {
  it<Context>("executes task in parallel", async ({ queue }) => {
    const promise = () =>
      new Promise<Array<string>>((res) => {
        const result = Array<string>()

        const tasks = [
          createDummyTask({
            finishAfterMs: 5,
            success: true,
            resultSetter: () => {
              result.push("task1")
            },
          }),
          createDummyTask({
            finishAfterMs: 1,
            success: true,
            resultSetter: () => {
              result.push("task2")
            },
          }),
        ]

        setTimeout(() => {
          res(result)
        }, 10)

        tasks.forEach(queue.addTask)
      })

    const result = await promise()

    expect(result).toStrictEqual(["task2", "task1"])
  })

  it<Context>("cancels running task", async ({ queue }) => {
    const promise = () =>
      new Promise<Array<string>>((res) => {
        const result = Array<string>()

        const tasks = [
          createDummyTask({
            finishAfterMs: 5,
            success: true,
            identifier: "task1",
            resultSetter: () => {
              result.push("task1")
            },
          }),
          createDummyTask({
            finishAfterMs: 5,
            success: true,
            identifier: "task2",
            resultSetter: () => {
              result.push("task2")
            },
          }),
        ]

        tasks.forEach(queue.addTask)

        setTimeout(() => {
          queue.cancelTask("task2")
        }, 0)

        setTimeout(() => {
          res(result)
        }, 10)
      })

    const result = await promise()

    expect(result).toStrictEqual(["task1"])
  })
})
