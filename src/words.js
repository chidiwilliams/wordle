function getRandomWord(words) {
  const index = Math.round(Math.random() * words.length);
  return { index, word: words[index] };
}

function compareWords(chosen, target) {
  const targetLetterCounts = new Map();
  for (const letter of target) {
    targetLetterCounts.set(
      letter,
      targetLetterCounts.has(letter) ? targetLetterCounts.get(letter) + 1 : 1,
    );
  }

  const result = [];
  for (let i = 0; i < chosen.length; i++) {
    if (chosen[i] === target[i]) {
      result[i] = 2;
      targetLetterCounts.set(chosen[i], targetLetterCounts.get(chosen[i]) - 1);
    }
  }

  for (let i = 0; i < chosen.length; i++) {
    if (chosen[i] !== target[i]) {
      if (targetLetterCounts.get(chosen[i]) > 0) {
        result[i] = 1;
        targetLetterCounts.set(chosen[i], targetLetterCounts.get(chosen[i]) - 1);
      } else {
        result[i] = 0;
      }
    }
  }

  return result;
}

export { compareWords, getRandomWord };
