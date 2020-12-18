export function sum(array: number[]): number {
    return array.reduce((acc, k) => acc + k, 0);
}

export function mean(array: number[], n = array.length): number {
    return sum(array) / n;
}

export function sd(array: number[]): number {
    const n = array.length;
    const mu = mean(array);
    return Math.sqrt(sum(array.map((x) => Math.pow(x - mu, 2))) / n);
}

export function removeZeros(array: number[]): number[] {
    return array.filter((k) => k !== 0);
}