import { Graph } from "./Graph";
import { Event, TimeSimulator } from "./TimeSimulator";

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const graph = new Graph(10);

// Create regular graph
const nodeDegree = 4;
shuffle(graph.nodes()).forEach((nodeId) => {
    if (graph.nodeDegree(nodeId) < nodeDegree) {
        {
            const currentNeighbors = [...graph.edgesOf(nodeId)]
                .map((edge) => edge.neighborId);
            const candidates = graph.nodes()
                .filter((candidate) => candidate !== nodeId)
                .filter((candidate) => !currentNeighbors.includes(candidate))
                .filter((candidate) => graph.nodeDegree(candidate) < nodeDegree);
            shuffle(candidates)
                .slice(0, nodeDegree - graph.nodeDegree(nodeId))
                .forEach((candidate) => {
                    graph.setEdge(nodeId, candidate, 1);
                });
        }
    }
});
shuffle(graph.nodes()).forEach((nodeId) => {
    while (graph.nodeDegree(nodeId) < nodeDegree) {
        {
            const currentNeighbors = [...graph.edgesOf(nodeId)]
                .map((edge) => edge.neighborId);
            const candidates = graph.nodes()
                .filter((candidate) => candidate !== nodeId)
                .filter((candidate) => !currentNeighbors.includes(candidate))
                .filter((candidate) => graph.nodeDegree(candidate) === nodeDegree);
            shuffle(candidates)
        }
    }
});

const firstNode = 0;

const numOfMessagesSentPerNode: {  [key: number]: number } = {};
const numOfMessagesReceivedPerNode: { [key: number]: number } = {};

graph.nodes().forEach((nodeId) => {
    numOfMessagesSentPerNode[nodeId] = 0;
    numOfMessagesReceivedPerNode[nodeId] = 0;
})
numOfMessagesReceivedPerNode[firstNode] = -1;

const propagate = (sourceId: number | null, nodeId: number) => () => {
    numOfMessagesReceivedPerNode[nodeId] += 1;
    if (numOfMessagesSentPerNode[nodeId] > 0) {
        return []
    }  else {
        const events = [...graph.edgesOf(nodeId)]
            .filter((edge) => edge.neighborId !== sourceId)
            .map((edge) => new Event(edge.weight, propagate(nodeId, edge.neighborId)));
        numOfMessagesSentPerNode[nodeId] += events.length;
        return events;
    }
}

const timeSimulator = new TimeSimulator();
timeSimulator.execute(new Event(0, propagate(null, firstNode)));

console.table(graph.asAdjacencyMatrix());
console.table(numOfMessagesSentPerNode);
console.table(numOfMessagesReceivedPerNode);
console.info('Node degrees:', graph.nodeDegrees())

console.table({
    totalSent: Object.values(numOfMessagesSentPerNode).reduce((acc, val) => acc += val, 0),
    totalReceived: Object.values(numOfMessagesReceivedPerNode).reduce((acc, val) => acc += val, 0)
});