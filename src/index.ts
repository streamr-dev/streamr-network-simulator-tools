import { Event, TimeSimulator } from "./TimeSimulator";
import { generateRandomRegularGraph } from "./utils";

const graph = generateRandomRegularGraph(10, 4);

const numOfMessagesSentPerNode: {  [key: number]: number } = {};
const numOfMessagesReceivedPerNode: { [key: number]: number } = {};

graph.nodes().forEach((nodeId) => {
    numOfMessagesSentPerNode[nodeId] = 0;
    numOfMessagesReceivedPerNode[nodeId] = 0;
})

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

const firstNode = 0;
const firstEvent = new Event(0, propagate(null, firstNode));
numOfMessagesReceivedPerNode[firstNode] = -1;

const timeSimulator = new TimeSimulator();
timeSimulator.execute(firstEvent);

console.table(graph.asAdjacencyMatrix());
console.table(numOfMessagesSentPerNode);
console.table(numOfMessagesReceivedPerNode);
console.info('Node degrees:', graph.nodeDegrees())

console.table({
    totalSent: Object.values(numOfMessagesSentPerNode).reduce((acc, val) => acc + val, 0),
    totalReceived: Object.values(numOfMessagesReceivedPerNode).reduce((acc, val) => acc + val, 0)
});