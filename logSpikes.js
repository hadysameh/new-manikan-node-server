const fs = require('fs');

const recievedData = JSON.parse(fs.readFileSync('./recievedData.json'));

const keys = Object.keys(recievedData[0]); // Get the keys from the first object
const maxValues = {};
const minValues = {};
const differences = {};
// Initialize the max and min values
keys.forEach((key) => {
  maxValues[key] = -Infinity;
  minValues[key] = Infinity;
});

// Iterate through the array and update the max and min values
recievedData.forEach((item) => {
  keys.forEach((key) => {
    if (item[key] > maxValues[key]) {
      maxValues[key] = item[key];
    }
    if (item[key] < minValues[key]) {
      minValues[key] = item[key];
    }
  });
});
// Calculate the differences
keys.forEach((key) => {
  differences[key] = maxValues[key] - minValues[key];
});

console.log('Max Values:', maxValues);
console.log('Min Values:', minValues);
console.log('Differences:', differences);
