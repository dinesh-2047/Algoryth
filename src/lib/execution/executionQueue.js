const MAX_CONCURRENCY = Math.max(
  1,
  Number(process.env.EXECUTION_QUEUE_CONCURRENCY || 2)
);

const queue = [];
let activeCount = 0;

function runNext() {
  if (activeCount >= MAX_CONCURRENCY) return;
  if (queue.length === 0) return;

  const job = queue.shift();
  if (!job) return;

  activeCount += 1;
  const startedAt = Date.now();

  Promise.resolve()
    .then(() => job.task())
    .then((value) => {
      job.resolve({
        ...value,
        queueWaitMs: startedAt - job.queuedAt,
      });
    })
    .catch((error) => {
      if (error && typeof error === "object") {
        error.queueWaitMs = startedAt - job.queuedAt;
      }
      job.reject(error);
    })
    .finally(() => {
      activeCount -= 1;
      runNext();
    });
}

export function enqueueExecution(task) {
  if (typeof task !== "function") {
    throw new TypeError("enqueueExecution expects a function task.");
  }

  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject, queuedAt: Date.now() });
    runNext();
  });
}

export function getExecutionQueueState() {
  return {
    maxConcurrency: MAX_CONCURRENCY,
    activeCount,
    pendingCount: queue.length,
  };
}
