/**
 * @typedef {import('./type.js').IPost} IPost
 */

/**
 * @template T
 */
export class TopKQueue {
    /**
     * 
     * @param {(a:T, b:T) => number} comparator 
     * @param {number} capacity // capacity of queue size
     */
    constructor(comparator, capacity) {
        /**
         * @type {(a:T, b:T) => number}
         */
        this.comparator = comparator

        /**
         * @type {T[]}
         */
        this._list = []

        /**
         * @type {number}
         */
        this.capacity = capacity

        console.assert(this.capacity > 1);
    }

    size() {
        return this._list.length;
    }

    isEmpty() {
        return !this.size()
    }

    /**
     * 
     * @param {T} val 
     */
    enqueue(val) {
        if (this._list.length < this.capacity) {
            this._list.push(val)
            const size = this._list.length
            if (size === 1) return;

            this.update(this._list, size);
        } else if (this.comparator(val, this._list[0]) < 0) {
            this._list[0] = val
            this.heapify(this._list)
        }
    }

    /**
     * 
     * @param {T[]} array 
     * @param {number} n 
     */
    update(array, n) {
        // parent index count from 1
        const idx = n % 2 ? (n - 1) / 2 : n / 2
        if (this.comparator(array[n - 1], array[idx - 1]) > 0) {
            swap(array, n - 1, idx - 1)
            idx > 1 && this.update(array, idx)
        }
    }

    /**
     * 
     * @param {T[]} array 
     */
    heapify(array) {
        for (let i = Math.floor((array.length - 1) / 2); i >= 0; i--) {
            this.#heapify(array, i);
        }
    }

    /**
     * 
     * @param {T[]} array 
     * @param {number} i
     */
    #heapify(array, i) {
        const n = array.length - 1;
        let largest = i
        let l = 2 * i
        let r = 2 * i + 1

        if (l <= n && this.comparator(array[l], array[i]) > 0) {
            largest = l
        }

        if (r <= n && this.comparator(array[r], array[largest]) > 0) {
            largest = r
        }

        if (largest !== i) {
            swap(array, i, largest)
            this.#heapify(array, largest)
        }
    }

    sort() {
        let k = this._list.length - 1
        this.heapify(this._list)

        for (let i = k; i >= 0; i--) {
            swap(this._list, 0, k)
            k -= 1
            this.#heapify(this._list, 0)
        }
    }

    front() {
        return this._list[0]
    }

    dequeue() {
        const val = this._list.shift()
        this.heapify(this._list)
        return val
    }

    toArray() {
        return this._list.slice().sort(this.comparator)
    }
}

/**
 * @template T
 * @param {T[]} list 
 * @param {number} i 
 * @param {number} j 
 */
function swap(list, i, j) {
    const tmp = list[i]
    list[i] = list[j]
    list[j] = tmp
}