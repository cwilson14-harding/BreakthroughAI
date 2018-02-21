import {Task} from './task';

export class MCTSWorker {
  busy = false;
  currentTask: Task;

  private worker: Worker = new Worker('assets/scripts/worker.js');

  constructor(public workerFinishedCallback?: Function) {}

  assignTask(task: Task) {
    this.currentTask = task;

    if (this.busy) {
      this.terminate();
    }

    this.busy = true;
    this.worker.onmessage = (event: MessageEvent) => {
      this.busy = false;
      this.currentTask = undefined;

      // Notify the task's callback.
      if (task.callback) {
        task.callback(event, task);
      }

      // Notify the worker's parent that it has finished the task.
      if (this.workerFinishedCallback) {
        this.workerFinishedCallback(this);
      }
    };
    this.worker.postMessage(task.ms + '-' + task.node.state);
  }

  terminate() {
    this.worker.terminate();
    this.busy = false;
  }
}
