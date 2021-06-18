import { Event, TimeSimulator } from "../TimeSimulator";
import { forRounds, generateRandomRegularGraph, shuffle } from "../utils";

const NUM_OF_NODES = 100
const NODE_DEGREE = 4
const EDGE_DROP_RATE = 0.05
const NUM_OF_MESSAGES = 10000

/**
 * Experiment on the effect of unreliable connections on message delivery
 * guarantees.
 *
 * 1. A random regular graph with uniform edge weights is formed.
 * 2. Each edge has a small chance to drop a message when sending.
 * 3. Multiple messages are published to the graph, for each a random
 *    source node is picked.
 */

const graph = generateRandomRegularGraph(NUM_OF_NODES, NODE_DEGREE);

type MessageId = number;

const seenMessages: { [key: number]: Set<MessageId> } = {};

graph.nodes().forEach((nodeId) => {
    seenMessages[nodeId] = new Set<MessageId>();
});

const propagate = (sourceId: number | null, nodeId: number, messageId: MessageId) => () => {
    if (seenMessages[nodeId].has(messageId)) {
        return []
    }  else {
        seenMessages[nodeId].add(messageId);
        const edges = [...graph.edgesOf(nodeId)]
            .filter((edge) => edge.neighborId !== sourceId)
        const events: Event[] = []
        for (const edge of edges) {
            if (Math.random() > EDGE_DROP_RATE) {
                events.push(new Event(edge.weight, propagate(nodeId, edge.neighborId, messageId)));
            }
        }
        return events;
    }
}

const timeSimulator = new TimeSimulator();
for (const idx of forRounds(NUM_OF_MESSAGES)) {
    const randomNode = shuffle(graph.nodes())[0];
    const publishMessageEvent = new Event(0, propagate(null, randomNode, idx));
    timeSimulator.execute(publishMessageEvent);
}

const expectedTotalUniqueMessages = NUM_OF_MESSAGES * NUM_OF_NODES
const uniqueMessagesReceivedPerNode = Object.values(seenMessages)
    .map((s) => s.size)
const totalUniqueMessages = uniqueMessagesReceivedPerNode
    .reduce((acc, el) => acc + el)
const numOfNodesThatReceivedAll = uniqueMessagesReceivedPerNode
    .filter((el) => el === NUM_OF_MESSAGES).length

//console.table(uniqueMessagesReceivedPerNode);
//console.info('Node degrees:', graph.nodeDegrees())
console.info('Message delivery rate:',
    totalUniqueMessages / expectedTotalUniqueMessages)
console.info('Number of missed messages: ',
    expectedTotalUniqueMessages - totalUniqueMessages, '/', expectedTotalUniqueMessages)
console.info('Nodes that received all', numOfNodesThatReceivedAll, '/', NUM_OF_NODES)
