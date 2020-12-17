export function sum(array: number[]): number {
    return array.reduce((acc, k) => acc + k, 0)
}

export function mean(array: number[], n = array.length): number {
    return sum(array) / n;
}

export function sd(array: number[]): number {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

export function removeZeros(array: number[]): number[] {
    return array.filter((k) => k !== 0)
}