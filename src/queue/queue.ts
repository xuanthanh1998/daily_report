 export class AsyncQueue {
    private queue: (() => Promise<void>)[] = [];
    private isRunning = false;

    enqueue(task: () => Promise<void>) {
        console.log('[Queue] Task enqueued');
        this.queue.push(task);
        this.run();
    }

    private async run() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[Queue] Processing started');

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                console.log('[Queue] Running task');
                try {
                    await task();
                    console.log('[Queue] Task completed');
                } catch (err) {
                    console.error('[Queue] Task failed:', err);
                }
            }
        }

        this.isRunning = false;
        console.log('[Queue] Processing finished');
    }
}
