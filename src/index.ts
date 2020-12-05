import { select } from 'floyd-rivest';

enum CMP {
  LT = -1,
  EQ = 0,
  GT = 1,
}

const defaultComp = <T>(a: T, b: T) => {
  if(typeof a === 'number') return Math.sign(a - (+b));
  return (""+a).localeCompare(""+b);
};

function isMinLevel(i: number): boolean {
  return (Math.log2(i + 1) & 1) === 0;
}

export class PriorityDeque<T> {

  private heap: T[] = [];
  private size = 0;
  private limit = Infinity;

  private compare: (a: T, b: T) => CMP = defaultComp;

  public constructor(opts: {
    compare?: (a: T, b: T) => number,
    limit?: number,
    items?: Iterable<T>,
  } = {}) {
    if (typeof opts.compare === 'function' && opts.compare !== defaultComp) {
      const c = opts.compare;
      this.compare = (a, b) => Math.sign(c(a, b));
    }
    if (typeof opts.limit === 'number') {
      this.limit = opts.limit;
    }
    if (opts.items && typeof opts.items[Symbol.iterator] === 'function') {
      this.set(opts.items); 
    }
  }

  public clone(): PriorityDeque<T> {
    const pd = new PriorityDeque({
      compare: this.compare,
      limit: this.limit,
    });
    pd.heap = [...this.heap];
    pd.size = this.size;

    return pd;
  }

  /** Heap Maintenance Methods **/

  private reheap(i: number) {
    for (; i >= 0; i--) {
      this.trickleDown(i);
    }
  }

  public set(elements: Iterable<T>) {
    const items = [...elements];
    const { length } = items;
    const { limit } = this;
    if (length > limit) {
      select(items, limit, this.compare);
      this.heap = items.slice(0, limit);
      this.size = limit;
    } else {
      this.heap = items;
      this.size = length;
    }
    
    this.reheap(this.size >> 1);
  }

  public clear() {
    this.heap.length = 0;
    this.size = 0;
  }

  private trickleDown(i: number) {
    const { heap, compare } = this;
    const [LT, GT] = isMinLevel(i) ? [CMP.LT, CMP.GT] : [CMP.GT, CMP.LT];

    while (true) {
      const { has, m, isgc } = this.getSmallestDescendent(i, GT);
      if (!has) break;

      const [hm, hi] = [heap[m], heap[i]];
      if (compare(hm, hi) === LT) {
        [heap[i], heap[m]] = [hm, hi];

        if(isgc) {
          const p = (m - 1) >> 1;
          const hp = heap[p];
          if (compare(hi, hp) === GT) {
            [heap[p], heap[m]] = [hi, hp];
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

  private bubbleUp(i: number): boolean { // i is always > 0
    const { heap, compare } = this;
    const p = (i - 1) >> 1;
    const [hi, hp] = [heap[i], heap[p]];
    const cmp = compare(hi, hp);
    let moved = false;

    let LT = CMP.LT;
    if (isMinLevel(i)) {
      if (cmp === CMP.GT) {
        [heap[i], heap[p]] = [hp, hi];
        i = p;
        LT = CMP.GT;
        moved = true;
      }
    } else if (cmp === CMP.LT) {
      [heap[i], heap[p]] = [hp, hi];
      i = p;
      moved = true;
    } else {
      LT = CMP.GT;
    }
    
    while (i >= 3) {
      const gp = (((i - 1) >> 1) - 1) >> 1;
      const [hi, hp] = [heap[i], heap[gp]];
      if (compare(hi, hp) === LT) {
        [heap[i], heap[gp]] = [hp, hi];
        i = gp;
        moved = true;
      } else break;
    }

    return moved;
  }

  /** Array-Like Methods **/

  public [Symbol.iterator](): IterableIterator<T> {
    return this.heap.values();
  }

  public get length() {
    return this.size;
  }

  public push(...elements: T[]) {
    if (this.limit === 0) return;
    if (elements.length === 0) return;

    const { heap, compare } = this;

    const l = elements.length;
    const addable = Math.min(this.limit - this.size, l);

    let i = 0;
    if (this.size === 0) {
      heap[0] = elements[0];
      this.size = 1;
      i = 1;
    }

    for (; i < addable; i++) {
      const e = elements[i];
      const index = this.size++;
      this.heap[index] = e;
      this.bubbleUp(index);
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
        if (compare(e, maxE) !== CMP.LT) continue;

        heap[maxI] = e;
        if (!this.bubbleUp(maxI)) {
          this.trickleDown(maxI);
        }

        maxI = this.maxIndex();
        maxE = heap[maxI];
      }
    }
  }

  public pop(): T | undefined {
    if (this.size === 0) return undefined;
    return this.removeAt(0);
  }

  public shift(): T | undefined {
    if (this.size === 0) return undefined;
    return this.removeAt(this.maxIndex());
  }

  public unshift(...elements: T[]) {
    this.push(...elements);
  }

  public map<U>(fn: (e: T) => U, compare: (a: U, b: U) => number = defaultComp): PriorityDeque<U>  {
    const pd = new PriorityDeque({ compare, limit: this.limit });
    pd.heap = this.heap.map(fn);
    pd.size = this.size;
    pd.reheap(this.size >> 1);

    return pd;
  }

  public filter(fn: (e: T) => boolean): PriorityDeque<T>  {
    const pd = new PriorityDeque({
      compare: this.compare,
      limit: this.limit,
    });
    pd.heap = this.heap.filter(fn);
    pd.size = pd.heap.length;
    pd.reheap(pd.size >> 1);

    return pd;
  }

  public collect<U>(
    fn: (e: T) => Iterable<U>,
    compare: (a: U, b: U) => number = defaultComp
  ): PriorityDeque<U> {
    const pd = new PriorityDeque({ compare, limit: this.limit });
    const heap: U[] = [];
    for (const e of this.heap)
      for (const v of fn(e))
        heap.push(v);

    pd.heap = heap;
    pd.size = heap.length;
    pd.reheap(pd.size >> 1);

    return pd;
  }

  public contains(e: T): boolean {
    return this.heap.indexOf(e) > -1;
  }

  public some(fn: (e: T) => boolean): boolean {
    return this.heap.some(fn);
  }

  public every(fn: (e: T) => boolean): boolean {
    return this.heap.every(fn);
  }

  public find(fn: (e: T) => boolean): T | undefined {
    return this.heap.find(fn);
  }

  public forEach(fn: (e: T) => void) {
    this.heap.forEach(fn);
  }

  /** Heap-Specific Methods **/

  public findMin(): T | undefined {
    return this.size > 0 ? this.heap[0] : undefined;
  }

  public findMax() : T | undefined {
    return this.size > 0 ? this.heap[this.maxIndex()] : undefined;
  }

  private maxIndex() {
    if (this.size < 2) return 0;
    if (this.size === 2) return 1;

    const { heap } = this;
    
    return this.compare(heap[1], heap[2]) === CMP.LT ? 2 : 1;
  }

  public replaceMin(e: T): T | undefined {
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

  public replaceMax(e: T): T | undefined {
    if (this.limit === 0) return undefined;

    const { heap } = this;
    const maxI = this.maxIndex();
    const maxE = heap[maxI];
    
    heap[maxI] = e;
    if (maxI > 0) {
      if (!this.bubbleUp(maxI)) {
        this.trickleDown(maxI);
      }
    } else {
      this.size = 1;
    }

    return maxE;
  }

  private removeAt(i: number): T {
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

  public remove(e: T): boolean {
    const { heap } = this;
    const i = heap.indexOf(e);
    if (i === -1) return false;

    this.removeAt(i);

    return true;
  }

  public replace(a: T, b: T): boolean {
    const { heap } = this;
    const i = heap.indexOf(a);
    if (i === -1) return false;
    if (i === 0) {
      heap[0] = b;
      this.trickleDown(0);
    } else {
      heap[i] = b;
      if (!this.bubbleUp(i)) {
        this.trickleDown(i);
      }
    }

    return true;
  }
}
