import { create2dTable, generateRandomRegularGraph, shuffle } from "../../src/utils";
import { mean, removeZeros, sd, sum } from "../../src/math"

function* forRounds(rounds: number): Generator<number, void> {
    for (let i=0; i < rounds; ++i) {
        yield i;
    }
}

describe(shuffle, () => {
    it('generates reasonably random permutations', () => {
        const numOfElements = 10;
        const numOfRounds = 20000;

        let recordings = create2dTable<number>(numOfElements);
        for (let round of forRounds(numOfRounds)) {
            shuffle([...Array(numOfElements).keys()]).forEach((value, index) => {
                recordings[value][index] += 1;
            })
        }

        // verify sum
        expect(sum(recordings.flat())).toEqual(numOfElements * numOfRounds);

        // verify mean
        const expectedMean = numOfRounds / numOfElements;
        expect(mean(recordings.flat())).toEqual(expectedMean);

        // verify that relative standard deviation is small enough
        const stddev = sd(recordings.flat());
        const rds = stddev / expectedMean;
        console.info('relative standard deviation', rds);
        expect(rds).toBeLessThan(0.05);
    })
})

describe(generateRandomRegularGraph, () => {
    it('generates reasonably random regular graphs', () => {
        const numOfNodes = 12;
        const numOfNeighbors = 4;
        const numOfRounds = 10000;

        let recordings = create2dTable<number>(numOfNodes);
        for (let round of forRounds(numOfRounds)) {
            const graph = generateRandomRegularGraph(numOfNodes, numOfNeighbors);
            graph.asAdjacencyMatrix().forEach((row, i) => {
                row.forEach((weight, j) => {
                    recordings[i][j] += weight;
                })
            })
        }

        // diagonal should be zero (node cannot be neighbor of itself)
        for (let i of forRounds(numOfNodes)) {
            expect(recordings[i][i]).toEqual(0);
        }

        // verify total sum of recordings
        const total = recordings.flat().reduce((acc, count) => acc + count, 0);
        expect(total).toEqual(numOfNodes * numOfNeighbors * numOfRounds)

        // verify row sums
        const rowSums = recordings.map((row: number[]) => sum(row));
        expect(rowSums.length).toEqual(numOfNodes);
        expect([...new Set(rowSums)]).toEqual([numOfRounds * numOfNeighbors]);

        // verify mean
        const expectedMean = (numOfRounds * numOfNeighbors) / (numOfNodes - 1);
        const actualMean = mean(recordings.flat(), recordings.flat().length - numOfNodes) // subtract diagonal
        expect(actualMean).toEqual(expectedMean)

        // verify that relative standard deviation is low
        const stddev = sd(removeZeros(recordings.flat()))
        const rds = stddev / expectedMean;
        console.info('relative standard deviation', rds);
        expect(rds).toBeLessThan(0.05);
    })
})