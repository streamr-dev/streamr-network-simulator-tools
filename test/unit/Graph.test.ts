import {Graph, GraphError} from "../../src/Graph";

describe('Graph', () => {
    let graph: Graph;

    beforeEach(() => {
        graph = new Graph(5);
    })

    it('cannot create graph with negative number of nodes', () => {
        expect(() => new Graph(-11)).toThrow(GraphError)
    });

    it('cannot create graph with zero nodes', () => {
        expect(() => new Graph(0)).toThrow(GraphError)
    });

    it('graph is initialized with correct dimensions and no edges', () => {
        expect(graph.nodes()).toStrictEqual([0, 1, 2, 3, 4]);
        expect(graph.asAdjacencyMatrix()).toStrictEqual([
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
    });

    it('adding edges', () => {
        graph.setEdge(1, 3, 100);
        graph.setEdge(0, 4, 250);
        expect(graph.asAdjacencyMatrix()).toStrictEqual([
            [0, 0, 0, 0, 250],
            [0, 0, 0, 100, 0],
            [0,   0, 0, 0, 0],
            [0, 100, 0, 0, 0],
            [250, 0, 0, 0, 0],
        ]);
    });

    it('removing edges', () => {
        graph.setEdge(1, 3, 100);
        graph.setEdge(0, 4, 250);

        graph.setEdge(1, 3, 0);
        graph.setEdge(0, 4, 0);

        expect(graph.asAdjacencyMatrix()).toStrictEqual([
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
    });


    it('cannot add edge between non-existing node and neighbor', () => {
        expect(() => graph.setEdge(666, 0, 100)).toThrow(GraphError);
    });

    it('cannot add edge between node and non-existing neighbor', () => {
        expect(() => graph.setEdge(0, 666, 100)).toThrow(GraphError);
    });

    it('cannot add edge from not to itself', () => {
        expect(() => graph.setEdge(0, 0, 100)).toThrow(GraphError);
    });

    it('cannot add edge with negative weight', () => {
        expect(() => graph.setEdge(0, 1, -200)).toThrow(GraphError);
    });

    it('getting edges of node without edges', () => {
        expect(graph.edgesOf(1)).toEqual(new Set());
    });

    it('getting edges of node with one edge', () => {
        graph.setEdge(0, 1, 100);
        expect(graph.edgesOf(1)).toEqual(new Set([
            {
                nodeId: 1,
                neighborId: 0,
                weight: 100
            }
        ]));
    });

    it('getting edges of node with three edge', () => {
        graph.setEdge(0, 1, 100);
        graph.setEdge(1, 3, 50);
        graph.setEdge(1, 4, 200);
        expect(graph.edgesOf(1)).toEqual(new Set([
            {
                nodeId: 1,
                neighborId: 0,
                weight: 100
            },
            {
                nodeId: 1,
                neighborId: 3,
                weight: 50
            },
            {
                nodeId: 1,
                neighborId: 4,
                weight: 200
            }
        ]));
    });

    it('cannot get edge of non-existing node', () => {
        expect(() => graph.edgesOf(666)).toThrow(GraphError);
    });

    it('get nodes of graph', () => {
        expect(graph.nodes()).toEqual([0, 1, 2, 3, 4])
    })

    it('getting node degree of node with no edges', () => {
        expect(graph.nodeDegree(1)).toEqual(0);
    });

    it('getting node degree of node with edges', () => {
        graph.setEdge(1, 0, 200);
        graph.setEdge(2, 1, 100);
        expect(graph.nodeDegree(1)).toEqual(2);
    });

    it('getting node degrees of all nodes', () => {
        graph.setEdge(0, 1, 200);
        graph.setEdge(2, 0, 300);
        expect(graph.nodeDegrees()).toEqual([2, 1, 1, 0, 0]);
    });

    it('checking if nodes has edge when no edge', () => {
        expect(graph.isEdgeBetween(2, 3)).toEqual(false);
    });

    it('checking if nodes have edge when there is one', () => {
        graph.setEdge(2, 3, 10);
        expect(graph.isEdgeBetween(3, 2)).toEqual(true);
    });
});