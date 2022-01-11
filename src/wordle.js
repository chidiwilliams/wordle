/**
 * Returns the word that is the best guess from the list of words
 * @param {string[]} words
 * @returns {string | undefined}
 */
function getBestGuess(words) {
  let letterScores = getLetterScores(words);

  let bestWord;
  let bestWordScore = Number.NEGATIVE_INFINITY;
  for (const word of words) {
    let score = getScore(word, letterScores);
    if (score > bestWordScore) {
      bestWord = word;
      bestWordScore = score;
    }
  }

  return bestWord;
}

// prettier-ignore
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

/**
 * Returns a map of each letter in the words to its score.
 * The score is calculated by frequency. The most frequently-occuring
 * letter gets a score of 0, while the least frequently-occuring gets
 * a score of 26.
 *
 * @param {string[]} words
 * @returns {Map<string, number>}
 */
function getLetterScores(words) {
  // Get the frequencies of the letters in the list of words
  const frequencies = new Map();
  for (const word of words) {
    for (const letter of word) {
      frequencies.set(letter, frequencies.has(letter) ? frequencies.get(letter) + 1 : 1);
    }
  }

  let letterScores = new Map();
  alphabet
    // Sort the letters by their frequencies (ascending)
    .sort((a, b) => ((frequencies.get(a) || 0) < (frequencies.get(b) || 0) ? -1 : 1))
    .forEach((letter, i) => {
      // Map each letter to its score
      letterScores.set(letter, i);
    });

  return letterScores;
}

const UNIQUENESS_SCORE_WEIGHT = 5;

/**
 * Returns a word's score. The score is calculated by summing the
 * scores of each letter in the word, and then subtracting five times
 * the number of unique letters in the word.
 *
 * @param {string} word
 * @param {Map<string, number>} letterScores
 * @returns {number}
 */
function getScore(word, letterScores) {
  let score = 0;

  // Add the score of each letter in the word
  for (let i = 0; i < word.length; i++) {
    score += letterScores.get(word[i]);
  }

  // This penalizes words that repeat the same characters in favour,
  // of words that use more different characters. The constant, 10,
  // serves as a way to weight the penalty vs the score of the letters
  // and can be adjusted as needed.
  const numUniqueLetters = new Set(word).size;
  score += numUniqueLetters * UNIQUENESS_SCORE_WEIGHT;

  return score;
}

/**
 * Filters only the valid words that match the result of the guess.
 * @param {string[]} words
 * @param {string} guess
 * @param {number[]} result
 */
function getSoundGuesses(words, guess, result) {
  // Map of index to correct value
  const correctLetters = new Map();
  // Map of index to misplaced value
  const misplacedLetters = new Map();
  // Wrongly guessed letters
  const wrongLetters = new Set();

  // Counts of each letter in the guess being correct (placed correctly/not)
  const numCorrect = new Map();
  const numMisplaced = new Map();

  for (let i = 0; i < result.length; i++) {
    const letter = guess[i];
    switch (result[i]) {
      case 0:
        wrongLetters.add(letter);
        break;
      case 1:
        misplacedLetters.set(i, letter);
        numMisplaced.set(letter, numMisplaced.has(letter) ? numMisplaced.get(letter) + 1 : 1);
        break;
      case 2:
        correctLetters.set(i, letter);
        numCorrect.set(letter, numCorrect.has(letter) ? numCorrect.get(letter) + 1 : 1);
        break;
      default:
        break;
    }
  }

  // Filter out the words that pass the requirements of the last guess's results
  return words.filter((word) =>
    isSoundGuess(word, correctLetters, wrongLetters, misplacedLetters, numCorrect, numMisplaced),
  );
}

function isSoundGuess(
  word,
  correctLetters,
  wrongLetters,
  misplacedLetters,
  numCorrect,
  numMisplaced,
) {
  // For each index in the word...
  for (let i = 0; i < word.length; i++) {
    // If we've already correctly guessed the value of this index, and
    // this word does not have that correct value, we can discard the word
    if (correctLetters.has(i) && correctLetters.get(i) !== word[i]) {
      return false;
    }
  }

  // For each index with a misplaced value
  for (const [index, value] of misplacedLetters) {
    let hasMisplaced = false;

    for (let i = 0; i < word.length; i++) {
      if (word[i] === value) {
        // If the word has the misplaced value in the same index, we can discard it
        if (index === i) {
          return false;
        }
        hasMisplaced = true;
      }
    }

    // And if the word does not have the misplaced value *at all*, we can also discard it
    if (!hasMisplaced) {
      return false;
    }
  }

  // Map of each letter in the word to the number of times it occurs
  const letterCounts = new Map();
  for (const letter of word) {
    letterCounts.set(letter, letterCounts.has(letter) ? letterCounts.get(letter) + 1 : 1);
  }

  // For each wrongly guessed letter...
  for (const letter of wrongLetters) {
    // If the word includes this letter...
    if (word.includes(letter)) {
      const numLetterOccurs = letterCounts.get(letter);

      // It should only occur exactly the sum of the number of times it was guessed right (wrong/right position)
      if (numLetterOccurs !== (numCorrect.get(letter) || 0) + (numMisplaced.get(letter) || 0)) {
        return false;
      }
    }
  }

  // Return true if all the checks pass
  return true;
}

module.exports = { getBestGuess, getSoundGuesses };
