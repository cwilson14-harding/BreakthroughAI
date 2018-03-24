import {MCTSWorkerScoring} from './mcts-worker-scoring';
import {Task} from '../task';

export class MCTSWorkerPoolScoring {
  static readonly THREAD_COUNT = 3;
  private workers: MCTSWorkerScoring[] = [];
  private tasks: Task[] = [];
  private allTasksCompletedCallback;

  constructor() {
    // Create the worker pool.
    this.getWorkers();
  }

  addTask(task: Task) {
    this.tasks.push(task);
    const worker: MCTSWorkerScoring = this.findAvailableWorker();
    if (worker) {
      worker.assignTask(task);
    }
  }

  clearTasks() {
    this.tasks = [];
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
  }

  onAllTasksCompleted(callback: Function) {
    this.allTasksCompletedCallback = callback;
  }

  private getWorkers(): MCTSWorkerScoring[] {
    for (let i = 0; i < MCTSWorkerPoolScoring.THREAD_COUNT; ++i) {
      this.workers.push(new MCTSWorkerScoring((worker: MCTSWorkerScoring) => {
        this.workerFinished(worker);
      }));
    }
    return this.workers;
  }

  private workerFinished(worker: MCTSWorkerScoring) {
    const task: Task = this.tasks.shift();
    if (task) {
      worker.assignTask(task);
    } else if (this.allTasksCompletedCallback && this.areAllTasksCompleted()) {
      this.allTasksCompletedCallback();
    }
  }

  private findAvailableWorker(): MCTSWorkerScoring {
    if (this.workers.length === 0) {
      this.getWorkers();
    }
    for (const worker of this.workers) {
      if (!worker.busy) {
        return worker;
      }
    }
  }

  private areAllTasksCompleted(): boolean {
    // Check if there are tasks in the queue.
    if (this.tasks.length > 0) {
      return false;
    }

    // Check if any workers are busy.
    for (const worker of this.workers) {
      if (worker.busy) {
        return false;
      }
    }

    return true;
  }
}
