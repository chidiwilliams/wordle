const words = require('./src/data/words.json');
const { getBestGuess, getSoundGuesses } = require('./src/wordle');
const { compareWords } = require('./src/words');

reportBenchmarks();

function reportBenchmarks() {
  const results = new Map();

  for (const word of words) {
    const result = getResult(word);
    const key = result.passed ? result.currentRow : 'X';
    results.set(key, results.has(key) ? results.get(key) + 1 : 1);
  }

  console.log(results);
}

function getResult(word) {
  let currWords = words;
  let comparison;
  let currentRow = 0;
  do {
    const guess = getBestGuess(currWords);
    comparison = compareWords(guess, word);
    currWords = getSoundGuesses(currWords, guess, comparison);
  } while (currentRow++ < Number.POSITIVE_INFINITY && !isPassed(comparison));

  return { currentRow, passed: isPassed(comparison) };
}

function isPassed(comparison) {
  return comparison.every((val) => val === 2);
}
