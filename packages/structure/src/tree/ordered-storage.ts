export interface OrderedStorage<T> {
    insert(index: number, value: T): void;
    remove(index: number): T | undefined;
    get(index: number): T | undefined;
    indexOf(value: T): number;
    size(): number;
    toArray(): T[];
}

export class ArrayStorage<T> implements OrderedStorage<T> {
    constructor(private arr: T[] = []) {}
    insert(index: number, value: T) {
        const i = Math.max(0, Math.min(index, this.arr.length));
        this.arr.splice(i, 0, value);
    }
    remove(index: number) {
        if (index < 0 || index >= this.arr.length) return undefined;
        return this.arr.splice(index, 1)[0];
    }
    get(index: number) {
        return this.arr[index];
    }
    indexOf(value: T) {
        return this.arr.indexOf(value);
    }
    size() {
        return this.arr.length;
    }
    toArray() {
        return this.arr.slice();
    }
}
