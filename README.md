# priority-deque

This package implements a double-ended priority queue, or priority deque, with optional size limits, based on an underlying min-max heap structure. This data structure provides efficient Insert, FindMin, FindMax, DeleteMin, and DeleteMax operations. The package has a single non-default export `{ PriorityDeque }`.

API
====

* `new PriorityDeque<T>(opts?: { compare?: (a: T, b: T) => number, limit?: number, items?: Iterable<T> })` Constructs a new `PriorityDeque`. By default, there are no size limits, numbers will be compared numerically, and all other objects will be compared by converting to strings and calling `String.localeCompare()`. If a finite non-negative `limit` is provided, the deque will automatically prune maximal elements to keep the total size of the structure less than or equal to `limit`.
* `clone(): PriorityDeque<T>` Creates a shallow copy of the deque with the same size limits and comparison function in O(n) time.
* `set(elements: Iterable<T>)` Replaces the contents of the deque with the smallest members, up to the size limit, of a new element set.
* `append(elements: T[])` Adds new elements to the deque.
* `clear()` Empties the deque.

Array-Like Methods
----

* `[Symbol.iterator](): IterableIterator<T>` Returns an iterator over all of the currently-stored values in the deque, suitable for use with `for(... of ...)` loops. No particular iteration order is guaranteed.
* `readonly length: number` Indicates how many total items are currently stored in the deque.
* `push(...elements: T[])` Adds new elements to the deque.
* `pop(): T | undefined` Removes and returns the minimum element from the deque, or `undefined` if `length` is zero.
* `shift(): T | undefined` Removes and returns the maximum element from the deque, or `undefined` if `lengt` is zero.
* `unshift(...elements: T[])` Synonym for `push()`.
* `map<U>(fn: (e: T) => U, compare?: (a: U, b: U) => number): PriorityDeque<U>` Creates a new `PriorityDeque` with the same limits as the current one by applying a mapping function to each element of the current deque. If an explicit comparison function is not provided for the new deque, the default numeric / string comparator will be used.
* `filter(fn: (e: T) => boolean): PriorityDeque<T>` Creates a new `PriorityDeque` with the same limits and comparison function as the current one but containing only a subset of the current deque's elements which satisfy the provided filtering predicate.
* `collect<U>(fn: (e: T) => Iterable<U>, compare?: (a: U, b: U) => number): PriorityDeque<U>` Creates a new `PriorityDeque` with the same limits as the current one by applying a collection function return 0 or more mapped elements to each element of the current deque. This is more efficient than calling `filter()` and `map()` in sequence. If an explicit comparison function is not provided for the new deque, the default numeric / string comparator will be used.
* `contains(e: T): boolean` Determines whether or not the deque contains a specific element, via `===` comparison.
* `some(fn: (e: T) => boolean): boolean` Determines whether or not any element of the deque satisfies the given predicate.
* `every(fn: (e: T) => boolean): boolean` Determines whether or not all elements of the deque satisfy the given predicate.
* `find(fn: (e: T) => boolean): T | undefined` Returns an element of the deque which satisfies the given predicate, or `undefined` if there is no such element.
* `forEach(fn: (e: T) => void)` Executes the given callback function once for each element of the deque; no specific ordering is guaranteed.

Heap-Specific Methods
----
* `findMin(): T | undefined` Returns the minimum element of the deque, or `undefined` if `length` is zero.
* `findMax(): T | undefined` Returns the maximum element of the deque, or `undefined` if `length` is zero.
* `replaceMin(e: T): T | undefined` Removes and returns the minimum element of the deque, or `undefined` if `length` is zero, and inserts the new element `e`. This is more efficient than calling `pop()` and `push(e)` separately.
* `replaceMax(e: T): T | undefined` Removes and returns the maximum element of the deque, or `undefined` if `length` is zero, and inserts the new element `e`. This is more efficient than calling `shift()` and `push(e)` separately.
* `remove(e: T): boolean` Removes the element `e` from the deque and returns true if `e` is in the deque; returns false otherwise.
* `replace(a: T, b: T): boolean` Removes the element `a` from the deque, inserts the element `b`, and returns true if `a` is in the deque. If `a` is not in the deque, `b` is not inserted, and false is returned. This is more efficient than calling `remove(a)` and `push(b)` separately.