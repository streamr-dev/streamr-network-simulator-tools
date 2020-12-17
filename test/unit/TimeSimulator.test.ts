import { TimeSimulator, Event } from "../../src/TimeSimulator";

describe('Event', () => {
    it('cannot create event with negative time', () => {
        expect(() => new Event(-1, () => [])).toThrow(Error)
    })

    it('can create event with zero time', () => {
        expect(() => new Event(0, () => [])).not.toThrow()
    })

    it('can create event with positive time', () => {
        expect(() => new Event(10, () => [])).not.toThrow()
    })
});

describe('TimeSimulator', () => {
    let simulator: TimeSimulator;

    beforeEach(() => {
        simulator = new TimeSimulator();
    })

    it('time starts off at 0', () => {
        expect(simulator.currentTime()).toEqual(0);
    })

    it('executing one event', () => {
        const action = jest.fn().mockReturnValueOnce([]);

        simulator.execute(new Event(10, action));

        expect(simulator.currentTime()).toEqual(10);
        expect(action).toHaveBeenCalledTimes(1);
    })

    it('executing three events separately', () => {
        const actionOne = jest.fn().mockReturnValueOnce([]);
        const actionTwo = jest.fn().mockReturnValueOnce([]);
        const actionThree = jest.fn().mockReturnValueOnce([]);

        simulator.execute(new Event(10, actionOne));
        simulator.execute(new Event(20, actionTwo));
        simulator.execute(new Event(30, actionThree));

        expect(simulator.currentTime()).toEqual(10 + 20 + 30);
        expect(actionOne).toHaveBeenCalledTimes(1);
        expect(actionTwo).toHaveBeenCalledTimes(1);
        expect(actionThree).toHaveBeenCalledTimes(1);
    })

    it('executing a tree of events separately', () => {
        const eventLog: any = [];
        const logAction = (id: string, nextEvents: Event[]) => () => {
            eventLog.push({
                id,
                time: simulator.currentTime()
            });
            return nextEvents;
        }
        const event8 = new Event(30, logAction("8", []));
        const event7 = new Event(10, logAction("7", []));
        const event6 = new Event(10, logAction("6", [event7]));
        const event5 = new Event(20, logAction("5", []));
        const event4 = new Event(10, logAction("4", [event8]));
        const event3 = new Event(20, logAction("3", [event6]));
        const event2 = new Event(10, logAction("2", [event4, event5]));
        const event1 = new Event(10, logAction("1", [event2, event3]));

        simulator.execute(event1);

        expect(simulator.currentTime()).toEqual(60);
        expect(eventLog).toEqual([
            { id: "1", time: 10 },
            { id: "2", time: 20 },
            { id: "3", time: 30 },
            { id: "4", time: 30 },
            { id: "5", time: 40 },
            { id: "6", time: 40 },
            { id: "7", time: 50 },
            { id: "8", time: 60 },
        ]);
    })
});