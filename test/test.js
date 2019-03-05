const { PriorityDeque } = require('../dist/priority-deque');
const items = Array.from({ length: 20 }, () => Math.round(Math.random()*100));


console.log(items.sort((a,b) => a-b));


const pd = new PriorityDeque({ limit: 10, items });
console.log('Construction:')
console.log('Max:', pd.findMax());
console.log('Min:', pd.findMin());

console.log("Pop:");
while (pd.length) {
    console.log(pd.pop());
}

pd.clear();
pd.push(...items);

console.log('Push:')
console.log('Max:', pd.findMax());
console.log('Min:', pd.findMin());

console.log("Pop:");
while (pd.length) {
    console.log(pd.pop());
}


/*
console.log("Shift:");
while (pd.length) {
    console.log(pd.shift());
}
*/