const assert = require('assert');
const fs = require('fs');
const { getBestGuess, getSoundGuesses } = require('./wordle');
const { compareWords } = require('./words');

const input = fs.readFileSync(__dirname + '/data/words.json').toString();
let allWords = JSON.parse(input);

// 09/01, gorge
{
  let words = allWords;
  let target = 'gorge';

  // assert.equal(getBestGuess(words), 'aeros');

  let guess = 'aeros';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'borde');

  guess = 'borde';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'forge');

  guess = 'forge';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'porge');

  guess = 'porge';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'gorge');
}

console.log('\n');

// 09/01, gorge
{
  let words = allWords;
  let target = 'gorge';
  assert.equal(getBestGuess(words), 'aeros');

  let guess = 'freed';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'aeros');

  guess = 'aeros';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'rorie');

  guess = 'rorie';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'borne');

  guess = 'borne';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'porge');

  guess = 'porge';
  console.log(`guessing ${guess} from ${words.length} words`);
  words = getSoundGuesses(words, guess, compareWords(guess, target));
  assert.equal(getBestGuess(words), 'gorge');
}
