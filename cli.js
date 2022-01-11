const fs = require('fs');
const readline = require('readline');
const { getBestGuess, getSoundGuesses } = require('./src/wordle');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const input = fs.readFileSync('./src/data/words.json').toString();
let words = JSON.parse(input);

function main() {
  console.log('possible matches:', words.length);
  console.log('guess:', getBestGuess(words));

  rl.question('> ', (answer) => {
    const guess = answer.slice(0, 6);
    const result = JSON.parse(answer.slice(6));

    words = getSoundGuesses(words, guess, result);
    main();
  });
}

main();
