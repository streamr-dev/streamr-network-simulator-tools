export class GraphError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "GraphError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export interface Edge {
    nodeId: number;
    neighborId: number;
    weight: number;
}

export class Graph {
    private readonly adjacencyMatrix: number[][];

    constructor(numOfNodes: number) {
        if (numOfNodes <= 0) {
            throw new GraphError(`numOfNodes not positive (${numOfNodes}).`)
        }
        this.adjacencyMatrix = new Array(numOfNodes);
        for (let i = 0; i < numOfNodes; ++i) {
            this.adjacencyMatrix[i] = new Array(numOfNodes).fill(0);
        }
    }

    asAdjacencyMatrix(): readonly number[][] {
        return this.adjacencyMatrix
    }

    setEdge(nodeId: number, neighborId: number, weight: number) {
        this.validateNodeId(nodeId);
        this.validateNodeId(neighborId);
        if (weight < 0) {
            throw new GraphError(`Edge weight cannot be negative (${weight}).`)
        }
        if (nodeId === neighborId) {
            throw new GraphError("Node cannot have an edge to itself.");
        }
        this.adjacencyMatrix[nodeId][neighborId] = this.adjacencyMatrix[neighborId][nodeId] = weight;
    }

    edgesOf(nodeId: number): Set<Edge> {
        this.validateNodeId(nodeId);
        const edges = new Set<Edge>();
        this.adjacencyMatrix[nodeId].forEach((weight, neighborId) => {
            if (weight !== 0) {
                edges.add({
                    nodeId,
                    neighborId,
                    weight
                });
            }
        });
        return edges;
    }

    isEdgeBetween(nodeId: number, neighborId: number): boolean {
        this.validateNodeId(nodeId);
        this.validateNodeId(neighborId);
        return this.adjacencyMatrix[nodeId][neighborId] != 0;
    }

    nodeDegree(nodeId: number): number {
        this.validateNodeId(nodeId);
        return this.edgesOf(nodeId).size;
    }

    nodeDegrees(): number[] {
        return this.adjacencyMatrix.map((row) => {
            return row.filter((weight) => weight != 0).length;
        });
    }

    nodes(): number[] {
        return Array.from(Array(this.adjacencyMatrix.length).keys());
    }

    private validateNodeId(nodeId: number): void {
        const upperLimit = this.adjacencyMatrix.length - 1;
        if (nodeId < 0 || nodeId > upperLimit) {
            throw new GraphError(`Invalid nodeId ${nodeId} (must be between 0 and ${upperLimit}).`);
        }
    }
}