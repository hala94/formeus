import { describe, it, expect, beforeEach, SpyInstance, vi } from "vitest";
import { createSerialQueue } from "../serialTaskQueue";
import { createDummyTask } from "./utils/createDummyTask";

type Context = {
  queue: ReturnType<typeof createSerialQueue>;
};

beforeEach<Context>(async (context) => {
  context.queue = createSerialQueue();
});

describe.concurrent("serialQueue", () => {
  it<Context>("executes task serially", async ({ queue }) => {
    const promise = () =>
      new Promise((res, rej) => {
        let result = undefined as string | undefined;

        const tasks = [
          createDummyTask({
            finishAfterMs: 5,
            success: true,
            resultSetter: () => {
              result = "task1";
            },
          }),
          createDummyTask({
            finishAfterMs: 0,
            success: true,
            resultSetter: () => {
              result = "task2";
            },
          }),
        ];

        queue.addTasks(tasks, () => {
          res(result);
        });
      });

    const result = await promise();
    expect(result).toBe("task2");
  });

  it<Context>("stops tasks execution on error", async ({ queue }) => {
    const promise = () =>
      new Promise((res, rej) => {
        let result = undefined as string | undefined;

        const tasks = [
          createDummyTask({
            finishAfterMs: 0,
            success: false,
            resultSetter: () => {
              result = "task1";
            },
          }),
          createDummyTask({
            finishAfterMs: 0,
            success: true,
            resultSetter: () => {
              result = "task2";
            },
          }),
        ];

        queue.addTasks(tasks, () => {
          res(result);
        });
      });

    const result = await promise();
    expect(result).toBe("task1");
  });

  it<Context>("calls onCancel on running task when cancelAllTasks called", async ({
    queue,
  }) => {
    type Test = {
      onCancel1: () => void;
      onCancel1Spy: SpyInstance<[], void> | undefined;
    };

    const promise = () =>
      new Promise<Test>((res, rej) => {
        const testObject: Test = {
          onCancel1: () => {},
          onCancel1Spy: undefined as SpyInstance<[], void> | undefined,
        };

        testObject.onCancel1Spy = vi.spyOn(testObject, "onCancel1");

        const tasks = [
          createDummyTask({
            finishAfterMs: 100,
            success: true,
            onCancelHandler: testObject.onCancel1,
          }),
          createDummyTask({
            finishAfterMs: 100,
            success: true,
          }),
        ];

        queue.addTasks(tasks, () => {});

        setTimeout(() => {
          queue.cancelAllTasks();
          res(testObject);
        }, 0);
      });

    const { onCancel1Spy } = await promise();
    expect(onCancel1Spy).toHaveBeenCalledOnce();
  });
});
