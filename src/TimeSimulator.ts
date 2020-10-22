import heap from 'heap';

export class Event {
    time: number;
    readonly action: () => Event[];

    constructor(time: number, action: () => Event[]) {
        if (time < 0) {
            throw new Error(`Time must be positive (${time}).`);
        }
        this.time = time;
        this.action = action;
    }
}

export class TimeSimulator {
    private time = 0;
    private readonly minHeap: heap<Event>;

    constructor() {
        this.minHeap = new heap<Event>((a, b) => a.time - b.time);
    }

    execute(initialEvent: Event): void {
        initialEvent.time += this.time;
        this.minHeap.push(initialEvent);
        while (!this.minHeap.empty()) {
            const { time, action } = this.minHeap.pop();
            this.time = time;
            const nextEvents = action();
            nextEvents.forEach((nextEvent) => {
                nextEvent.time += this.time;
                this.minHeap.push(nextEvent);
            })
        }
    }

    currentTime(): number {
        return this.time;
    }
}