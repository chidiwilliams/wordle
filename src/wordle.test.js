const assert = require('assert');
const fs = require('fs');
const { getBestGuess, updateGuessResult } = require('./wordle');

const input = fs.readFileSync('./words.json').toString();
let allWords = JSON.parse(input);

// 09/01, gorge
{
  let words = allWords;
  assert.equal(getBestGuess(words), 'aeros');

  console.log(`guessing 'aeros' from ${words.length} words`);
  words = updateGuessResult(words, 'aeros', [0, 1, 2, 1, 0]);
  assert.equal(getBestGuess(words), 'borde');

  console.log(`guessing 'borde' from ${words.length} words`);
  words = updateGuessResult(words, 'borde', [0, 2, 2, 0, 2]);
  assert.equal(getBestGuess(words), 'forge');

  console.log(`guessing 'forge' from ${words.length} words`);
  words = updateGuessResult(words, 'forge', [0, 2, 2, 2, 2]);
  assert.equal(getBestGuess(words), 'porge');

  console.log(`guessing 'porge' from ${words.length} words`);
  words = updateGuessResult(words, 'porge', [0, 2, 2, 2, 2]);
  assert.equal(getBestGuess(words), 'gorge');
}

console.log('\n');

// 09/01, gorge
{
  let words = allWords;
  assert.equal(getBestGuess(words), 'aeros');

  // choose word with one letter occuring twice
  console.log(`guessing 'freed' from ${words.length} words`);
  words = updateGuessResult(words, 'freed', [0, 1, 1, 0, 0]);
  assert.equal(getBestGuess(words), 'osier');

  console.log(`guessing 'osier' from ${words.length} words`);
  words = updateGuessResult(words, 'osier', [1, 0, 0, 1, 1]);
  assert.equal(getBestGuess(words), 'ronte');

  console.log(`guessing 'ronte' from ${words.length} words`);
  words = updateGuessResult(words, 'ronte', [1, 2, 0, 0, 2]);
  assert.equal(getBestGuess(words), 'powre');

  console.log(`guessing 'powre' from ${words.length} words`);
  words = updateGuessResult(words, 'powre', [0, 2, 0, 1, 2]);
  assert.equal(getBestGuess(words), 'horme');

  console.log(`guessing 'horme' from ${words.length} words`);
  words = updateGuessResult(words, 'horme', [0, 2, 2, 0, 2]);
  assert.equal(getBestGuess(words), 'corbe');

  console.log(`guessing 'corbe' from ${words.length} words`);
  words = updateGuessResult(words, 'corbe', [0, 2, 2, 0, 2]);
  assert.equal(getBestGuess(words), 'gorge');
}
