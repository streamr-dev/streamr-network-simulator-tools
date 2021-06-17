import { Event, TimeSimulator } from "../TimeSimulator";
import { generateRandomRegularGraph } from "../utils";

const NUM_OF_NODES = 10
const NODE_DEGREE = 4

/**
 * Experiment on the number of duplicate messages sent and received by
 * nodes in a network.
 *
 * 1. A random regular graph with uniform edge weights is formed.
 * 2. A single message is published to the graph.
 * 3. The number of times each node sent or received that message is recorded.
 *
 */

const graph = generateRandomRegularGraph(NUM_OF_NODES, NODE_DEGREE);

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
numOfMessagesReceivedPerNode[firstNode] = -1; // account for 1st event on 1st node

const timeSimulator = new TimeSimulator();
timeSimulator.execute(firstEvent);

//console.table(graph.asAdjacencyMatrix());
console.info('Messages sent:');
console.table(numOfMessagesSentPerNode);
console.info('Messages received:');
console.table(numOfMessagesReceivedPerNode);
console.info('Node degrees:', graph.nodeDegrees())

console.table({
    totalSent: Object.values(numOfMessagesSentPerNode).reduce((acc, val) => acc + val, 0),
    totalReceived: Object.values(numOfMessagesReceivedPerNode).reduce((acc, val) => acc + val, 0)
});
