import { TaskState } from "./serialTaskQueue";
import { createTask } from "./task";

type Task = ReturnType<typeof createTask>;

export function createParallelQueue() {
  let tasks = Array<Task>();
  let runningTasks = new Map<string, { task: Task; unsub: () => void }>();
  let pendingSchedule = false;

  function queueScheduleTask() {
    if (pendingSchedule) return;
    pendingSchedule = true;

    queueMicrotask(() => {
      pendingSchedule = false;
      scheduleTasks();
    });
  }

  function scheduleTasks() {
    if (tasks.length === 0) return;

    tasks.forEach((task) => {
      const unsub = task.subscribe(taskStateHandler);
      runningTasks.set(task.identifier, {
        task,
        unsub,
      });
      task.start();
    });

    tasks = [];
  }

  function taskStateHandler(taskState: TaskState) {
    switch (taskState.state) {
      case "idle":
        break;
      case "running":
        break;
      case "completed":
        const job = runningTasks.get(taskState.identifier);
        job?.unsub();
        runningTasks.delete(taskState.identifier);
    }
  }

  return {
    cancelTask: (identifier: string) => {
      const job = runningTasks.get(identifier);
      job?.unsub();
      job?.task.cancel();
      runningTasks.delete(identifier);
    },
    cancelAllTasks: () => {
      runningTasks.forEach((job, _) => {
        job?.unsub();
        job?.task.cancel();
      });
      runningTasks.clear();
    },
    addTask: (task: Task) => {
      tasks.push(task);
      queueScheduleTask();
    },
  };
}
