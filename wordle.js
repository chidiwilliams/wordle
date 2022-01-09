/**
 * Returns the word that is the best guess from the list of words
 * @param {string[]} words
 * @returns {string | undefined}
 */
function getBestGuess(words) {
  let letterScores = getLetterScores(words);

  let bestWord;
  let bestWordScore = Number.POSITIVE_INFINITY;
  words.forEach((word) => {
    let score = getScore(word, letterScores);
    if (score < bestWordScore) {
      bestWord = word;
      bestWordScore = score;
    }
  });

  return bestWord;
}

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
  const freqs = new Map();
  words.forEach((word) => {
    word.split('').forEach((letter) => {
      freqs.set(letter, freqs.has(letter) ? freqs.get(letter) + 1 : 1);
    });
  });

  let letterScores = new Map();

  // Generate a list of the letters from "a" to "z"
  Array.from({ length: 26 }, (_, j) => String.fromCharCode(j + 'a'.charCodeAt(0)))
    // Sort the letters by their frequencies (descending)
    .sort((a, b) => (freqs.get(a) < freqs.get(b) ? 1 : -1))
    .forEach((letter, i) => {
      // Map each letter to its score
      letterScores.set(letter, i);
    });

  return letterScores;
}

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

  // Subtract five times the number of unique letters in the word.
  // This penalizes words that repeat the same characters in favour,
  // of words that use more different characters. The constant, 10,
  // serves as a way to weight the penalty vs the score of the letters
  // and can be adjusted as needed.
  score -= new Set(word).size * 10;
  return score;
}

/**
 * Filters only the valid words that match the result of the guess.
 * @param {string[]} words
 * @param {string} guess
 * @param {number[]} result
 */
function updateGuessResult(words, guess, result) {
  // Group the wrong, misplaced, and right guesses from the result
  const wrongGuesses = new Set();
  const misplacedGuessesIds = new Set();
  const rightGuesses = new Map();
  for (let i = 0; i < result.length; i++) {
    switch (result[i]) {
      case 0:
        wrongGuesses.add(guess[i]);
        break;
      case 1:
        misplacedGuessesIds.add(i);
        break;
      case 2:
        rightGuesses.set(i, guess[i]);
        break;
    }
  }

  // Filter out the words that pass the requirements of the last guess's results
  return words.filter((word) => {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];

      // Remove this word if it has a wrong letter
      if (wrongGuesses.has(letter)) {
        return false;
      }

      // ...or if it does not have the right letter in its correct position
      if (rightGuesses.has(i) && rightGuesses.get(i) !== letter) {
        return false;
      }
    }

    for (const misplacedGuessId of misplacedGuessesIds) {
      let hasMisplaced = false;

      for (let j = 0; j < word.length; j++) {
        if (word[j] === guess[misplacedGuessId]) {
          // ...or if it has a misplaced letter in the same position
          if (misplacedGuessId === j) {
            return false;
          }
          hasMisplaced = true;
        }
      }

      // ...or if it does not have a misplaced letter anywhere
      if (!hasMisplaced) {
        return false;
      }
    }

    // Return true if all the checks pass (i.e. the word has no wrong letters, has
    // all the right letters in their correct positions, has no misplaced letter
    // in the same position, and has all the misplaced letters in new positions)
    return true;
  });
}

module.exports = { getBestGuess, updateGuessResult };
