enum Level {
    MIN = 0, MAX = 1
}

enum CMP {
    LT = -1,
    EQ = 0,
    GT = 1,
}

type Comparator<E> = (a: E, b: E) => CMP;

const defaultComp = <E>(a: E, b: E) => {
    if(typeof a === 'number') return Math.sign(a - (+b));
    return (""+a).localeCompare(""+b);
}

function parent(i: number): number {
    return i === 0 ? -1 : ((i - 1) >> 1);
}

function getLevel(i: number): Level {
    return Math.floor(Math.log2(i + 1)) & 1;
}

export class PriorityDeque<E> {

    private heap: E[] = [];

    private size = 0;

    private limit = Infinity;

    private compare: Comparator<E> = defaultComp;

    public constructor(opts: {
        compare?: Comparator<E>,
        limit?: number,
        items?: { [Symbol.iterator](): IterableIterator<E> },
    }) {
        if (typeof opts.compare === 'function') {
            const c = opts.compare;
            this.compare = (a, b) => Math.sign(c(a, b));
        }
        if (typeof opts.limit === 'number') {
            this.limit = opts.limit;
        }
        if (opts.items && typeof opts.items[Symbol.iterator] === 'function') {
            this.heap = [...opts.items];
            this.build_heap(); 
        }
    }

    private reheap(i: number) {
        for (; i >= 0; i--) {
            this.trickleDown(i);
        }
    }

    private build_heap() {
        const { length } = this.heap;
        this.size = length;
        this.reheap(length >> 1);

        while (this.size > this.limit) {
            this.shift();
        }
    }

    private trickleDown(i: number) {
        const { heap, compare } = this;
        const ismin = Level.MIN === getLevel(i);
        const [LT, GT] = ismin ? [CMP.LT, CMP.GT] : [CMP.GT, CMP.LT];

        while (true) {
            const { has, m, isgc } = this.getSmallestDescendent(i, GT);
            if (!has) break;

            const hm = heap[m];
            const hi = heap[i];
            if (compare(hm, hi) === LT) {
                heap[i] = hm;
                heap[m] = hi;

                if(isgc) {
                    const p = parent(m);
                    const hp = heap[p];
                    if (compare(hi, hp) === GT) {
                        heap[p] = hi;
                        heap[m] = hp;
                    }
                    i = m;
                    continue;
                }
            }

            break;
        }
    }

    private getSmallestDescendent(i: number, GT: CMP) {
        const { heap, size, compare } = this;
        
        const l = (i << 1) + 1;
        if (l >= size) return { has: false, isgc: false, m: l };

        const r = l + 1;
        if (r >= size) return { has: true, isgc: false, m: l };
        
        const { has: hasl, m: lc } = this.getSmallestChild(l, GT);
        if (!hasl) {
            return {
                has: true,
                isgc: false,
                m: compare(heap[l], heap[r]) === GT ? r : l,
            };     
        }

        const { has: hasr, m: rc } = this.getSmallestChild(r, GT);
        if (!hasr) return { has: true, isgc: true, m: lc };

        return {
            has: true,
            isgc: true,
            m: compare(heap[lc], heap[rc]) === GT ? rc : lc,
        };    

    }

    private getSmallestChild(i: number, GT: CMP) {
        const { size, heap, compare } = this;
        
        const l = (i << 1) + 1;
        if (l >= size) return { has: false, m: l };

        const r = l + 1;
        if (r >= size) return { has: true, m: l };

        return {
            has: true, 
            m: compare(heap[l], heap[r]) === GT ? r : l,
        }; 
    }

    public [Symbol.iterator](): IterableIterator<E> {
        return this.heap.values();
    }

    public map<F>(fn: (e: E) => F, compare: Comparator<F> = defaultComp) {
        const pd = new PriorityDeque({ compare, limit: this.limit });
        pd.heap = this.heap.map(fn);
        pd.build_heap();

        return pd;
    }

    public filter(fn: (e: E) => boolean) {
        const pd = new PriorityDeque({ compare: this.compare, limit: this.limit });
        pd.heap = this.heap.filter(fn);
        pd.build_heap();

        return pd;
    }

    public some(fn: (e: E) => boolean) {
        return this.heap.some(fn);
    }

    public every(fn: (e: E) => boolean) {
        return this.heap.every(fn);
    }

    public find(fn: (e: E) => boolean) {
        return this.heap.find(fn);
    }

    public forEach(fn: (e: E) => void) {
        this.heap.forEach(fn);
    }

    public get length() {
        return this.size;
    }

    public pop(): E | undefined {
        if (this.size === 0) return undefined;

        return this.removeAt(0);
    }

    public shift(): E | undefined {
        if (this.size === 0) return undefined;

        return this.removeAt(this.maxIndex());
    }

    public peekMin(): E | undefined {
        return this.size > 0 ? this.heap[0] : undefined;
    }

    public peekMax() : E | undefined {
        return this.size > 0 ? this.heap[this.maxIndex()] : undefined;
    }

    private maxIndex() {
        if (this.size < 2) return 0;
        if (this.size === 2) return 1;

        const { heap } = this;
        
        return this.compare(heap[1], heap[2]) === CMP.LT ? 2 : 1;
    }

    public clone(): PriorityDeque<E> {
        const pd = new PriorityDeque({ compare: this.compare, limit: this.limit });
        pd.heap = [...this.heap];
        pd.size = this.size;

        return pd;
    }

    public push(...elements: E[]) {
        if (this.limit === 0) return;

        const { heap, compare } = this;

        let i = 0;
        const l = elements.length;
        const addable = Math.min(this.limit - this.size, l);
        for (; i < addable; i++) {
            const e = elements[i];
            const index = this.size++;
            this.heap[index] = e;
            if (index > 0) {
                this.bubbleUp(index);
            }
        }

        if (this.limit === 1) {
            for (; i < l; i++) {
                const e = elements[i];
                if (compare(e, heap[0]) === CMP.LT) {
                    heap[0] = e;
                }
            }
        } else {
            let maxI = this.maxIndex();
            let maxE = heap[maxI];
            for (; i < l; i++) {
                const e = elements[i];
                if (compare(e, maxE) !== CMP.LT) {
                    continue;
                }

                heap[maxI] = e;
                this.trickleDown(maxI);
                this.trickleDown(0);

                maxI = this.maxIndex();
                maxE = heap[maxI];
            }
        }
    }

    public unshift(...elements: E[]) {
        this.push(...elements);
    }

    public replaceMin(e: E) {
        if (this.limit === 0) return undefined;

        const { heap } = this;
        const minE = heap[0];
        heap[0] = e;
        if (this.size > 0) {
            this.trickleDown(0);
        } else {
            this.size = 1;
        }

        return minE;
    }

    public replaceMax(e: E) {
        if (this.limit === 0) return undefined;

        const { heap } = this;
        const maxI = this.maxIndex();
        const maxE = heap[maxI];
        
        heap[maxI] = e;
        if (maxI > 0) {
            this.trickleDown(maxI);
            this.trickleDown(0);
        } else {
            this.size = 1;
        }

        return maxE;
    }

    private bubbleUp(i: number) {
        const { heap, compare } = this;
        const p = parent(i);
        let LT = CMP.LT;
        let hi = heap[i];
        let hp = heap[p];
        if (Level.MIN === getLevel(i)) {
            if (p > -1 && compare(hi, hp) === CMP.GT) {
                heap[i] = hp;
                heap[p] = hi;
                i = p;
                LT = CMP.GT;
            }
        } else if (p > -1 && compare(hi, hp) === CMP.LT) {
            heap[i] = hp;
            heap[p] = hi;
            i = p;
        } else {
            LT = CMP.GT;
        }
        
        while (true) {
            if (i < 3) break;
            const gp = (((i - 1) >> 1) - 1) >> 1;

            hi = heap[i];
            hp = heap[gp];
            if (compare(hi, hp) === LT) {
                heap[i] = hp;
                heap[gp] = hi;
                i = gp;
            } else break;
        }
    }

    public contains(e: E): boolean {
        return this.heap.indexOf(e) > -1;
    }

    public clear() {
        this.heap.length = 0;
        this.size = 0;
    }

    private removeAt(i: number): E {
        this.size--;
        const { size, heap } = this;
        const ret = heap[i];
        if (size > 0) {
            heap[i] = heap[size];
            heap.length = size;
            this.trickleDown(i);
        } else {
            heap.length = 0;
        }

        return ret;
    }

    public remove(e: E): boolean {
        const { heap } = this;
        const i = heap.indexOf(e);
        if (i === -1) return false;

        this.removeAt(i);

        return true;
    }

    public replace(a: E, b: E): boolean {
        const { heap } = this;
        const i = heap.indexOf(a);
        if (i === -1) return false;
    
        heap[i] = b;
        this.reheap(i);

        return true;
    }
}
