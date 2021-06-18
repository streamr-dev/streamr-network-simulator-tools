import { Event, TimeSimulator } from "../TimeSimulator";
import { forRounds, generateRandomRegularGraph, shuffle } from "../utils";
import { mean, sd } from "../math"

const NUM_OF_NODES = 100
const NODE_DEGREE = 4
const EDGE_WEIGHT_FN = () => Math.floor(Math.random() * 100) // uniform ]0,100[
const NUM_OF_MESSAGES = 10000

/**
 * Experiment on how connection latencies affect message delivery latency.
 *
 * 1. A random regular graph with varying edge weights is formed.
 * 2. Multiple messages are published to the graph, for each a random
 *    source node is picked.
 * 3. Analyze latencies observed by nodes
 */

const graph = generateRandomRegularGraph(NUM_OF_NODES, NODE_DEGREE, EDGE_WEIGHT_FN);

type MessageId = number
type Latency = number

const seenMessages: { [key: number]: Set<MessageId> } = {}
const observedLatency: { [key: number]: Array<Latency> } = {}

graph.nodes().forEach((nodeId) => {
    seenMessages[nodeId] = new Set<MessageId>()
    observedLatency[nodeId] = []
});

const propagate = (
    sourceId: number | null,
    nodeId: number,
    messageId: MessageId,
    accumulatedLatency: number
) => () => {
    if (seenMessages[nodeId].has(messageId)) {
        return []
    }  else {
        seenMessages[nodeId].add(messageId)
        observedLatency[nodeId].push(accumulatedLatency)
        const edges = [...graph.edgesOf(nodeId)]
            .filter((edge) => edge.neighborId !== sourceId)
        return edges.map((edge) => new Event(
            edge.weight,
            propagate(nodeId, edge.neighborId, messageId, accumulatedLatency + edge.weight)
        ))
    }
}

const timeSimulator = new TimeSimulator();
for (const idx of forRounds(NUM_OF_MESSAGES)) {
    const randomNode = shuffle(graph.nodes())[0];
    const publishMessageEvent = new Event(0, propagate(null, randomNode, idx, 0));
    timeSimulator.execute(publishMessageEvent);
}

console.info(mean(Object.values(observedLatency).flat()))
console.info(sd(Object.values(observedLatency).flat()))
