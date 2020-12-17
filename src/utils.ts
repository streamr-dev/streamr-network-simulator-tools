import { Graph } from "./Graph";

export function create2dTable<T>(n: number): T[][] {
    const rows = new Array(n);
    for (let i = 0; i < rows.length; ++i) {
        rows[i] = new Array(n).fill(0);
    }
    return rows;
}

export function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateRandomRegularGraph(numOfNodes: number, nodeDegree: number, weightFn = () => 1): Graph {
    const graph = new Graph(numOfNodes);

    function isDone(graph: Graph, nodeDegree: number) {
        const sumOfNodeDegrees = graph.nodeDegrees()
            .reduce((acc, degree) => acc + degree, 0)
        return sumOfNodeDegrees >= (nodeDegree * graph.nodes().length) - 1
    }

    while (true) {
        shuffle(graph.nodes()).forEach((nodeId) => {
            if (graph.nodeDegree(nodeId) < nodeDegree) {
                const currentNeighbors = graph.neighborsOf(nodeId);
                const candidates = graph.nodes()
                    .filter((candidate) => candidate !== nodeId)
                    .filter((candidate) => !currentNeighbors.includes(candidate))
                    .filter((candidate) => graph.nodeDegree(candidate) < nodeDegree);

                shuffle(candidates)
                    .slice(0, nodeDegree - graph.nodeDegree(nodeId))
                    .forEach((candidate) => {
                        graph.setEdge(nodeId, candidate, weightFn());
                    });
            }
        });
        if (isDone(graph, nodeDegree)) {
            return graph;
        } else {
            const [randomNode] = shuffle(graph.nodes());
            const [randomEdge] = shuffle([...graph.edgesOf(randomNode)]);
            if (randomEdge) {
                graph.setEdge(randomEdge.nodeId, randomEdge.neighborId, 0);
            }
        }
    }
}