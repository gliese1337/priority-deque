import 'mocha';
import { expect } from 'chai';
import { PriorityDeque } from '../src';


const items = [
   0,  0,  0,  0,  0,  0,  0,  1,  1,  2,  2,  2,
   2,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,
   4,  4,  4,  4,  5,  5,  5,  6,  6,  6,  6,  6,
   7,  7,  8,  8,  8,  8,  8,  9,  9,  9,  9, 10,
  10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12,
  13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14,
  14, 14, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16,
  16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19,
  19, 20, 20, 20
];
/*
[
   0,  0,  0,  0,  0,  0,  1,  2,  3,  3,  3,  3,
   3,  3,  4,  4,  4,  4,  4,  4,  4,  4,  4,  5,
   5,  5,  6,  6,  6,  6,  6,  6,  6,  6,  6,  7,
   7,  7,  7,  7,  7,  8,  8,  8,  8,  8,  8,  9,
   9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11,
  12, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15,
  15, 15, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17,
  17, 17, 18, 18, 18, 18, 18, 19, 19, 19, 19, 20,
  20, 20, 20, 20
]
*/

//const items = Array.from({ length: 100 }, () => Math.round(Math.random()*20));
items.sort((a,b) => a-b);
console.log(items);

describe("PriorityDeque Tests", () => {
  for (let j = 10; j <= 10; j += 10) {
    it.only(`Should construct a correct deque with ${j} initial elements.`, () => {
      const pd = new PriorityDeque({ limit: 10, items });
      expect(pd.length).to.eql(10);
      expect(pd.findMin()).to.eql(items[0]);
      expect(pd.findMax()).to.eql(items[9]);
      console.log(pd.heap);
      console.log(items.slice(0, 10));
      for (let i = 0; i < 10; i++) {
        const p = pd.pop();
        console.log(i, items[i], p, JSON.stringify(pd.heap));
        expect(p).to.eql(items[i]);
      }
    });
    
    it(`Should pop ${j} elements in order.`, () => {
      const pd = new PriorityDeque({ limit: 10, items });
      for (let i = 0; i < 10; i++) {
        expect(pd.pop()).to.eql(items[i]);
      }
    });
    
    it(`Should shift ${j} elements in order.`, () => {
      const pd = new PriorityDeque({ limit: 10, items });
      for (let i = 0; i < 10; i++) {
        expect(pd.shift()).to.eql(items[9 - i]);
      }
    });

    it.only(`Should construct a correct deque with ${j} bulk pushed elements.`, () => {
      const pd = new PriorityDeque({ limit: 10 });
      pd.push(...items);
      expect(pd.length).to.eql(10);
      expect(pd.findMin()).to.eql(items[0]);
      expect(pd.findMax()).to.eql(items[9]);
      console.log(pd.heap);
      console.log(items.slice(0, 10));
      for (let i = 0; i < 10; i++) {
        const p = pd.pop();
        console.log(i, items[i], p, JSON.stringify(pd.heap));
        expect(p).to.eql(items[i]);
      }
    });

    it.only(`Should construct a correct deque with ${j} incrementally pushed elements.`, () => {
      const pd = new PriorityDeque({ limit: 10 });
      for (let i = 0; i < 10; i++) {
        pd.push(items[i]);
        expect(pd.length).to.eql(i + 1);
        expect(pd.findMax()).to.eql(items[i]);
      }
      expect(pd.findMin()).to.eql(items[0]);
      console.log(pd.heap);
      console.log(items.slice(0, 10));
      for (let i = 0; i < 10; i++) {
        const p = pd.pop();
        console.log(i, items[i], p, JSON.stringify(pd.heap));
        expect(p).to.eql(items[i]);
      }
    });
  }
});