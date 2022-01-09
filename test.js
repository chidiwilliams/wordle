const fs = require('fs');
const { getBestGuess, updateGuessResult } = require('./wordle');

const text = fs.readFileSync('./words.json').toString();

let words = JSON.parse(text);

console.log(words.length);
console.log(getBestGuess(words));

words = updateGuessResult(words, 'aeros', [0, 1, 2, 1, 0]);
console.log(words.length);
console.log(getBestGuess(words));

words = updateGuessResult(words, 'borde', [0, 2, 2, 0, 2]);
console.log(words.length);
console.log(getBestGuess(words));

words = updateGuessResult(words, 'forge', [0, 2, 2, 2, 2]);
console.log(words.length);
console.log(getBestGuess(words));

words = updateGuessResult(words, 'porge', [0, 2, 2, 2, 2]);
console.log(words.length);
console.log(getBestGuess(words));

// words = updateGuessResult(words, 'drank', [0, 2, 2, 2, 2]);
// console.log(words.length);
// console.log(getBestGuess(words));
