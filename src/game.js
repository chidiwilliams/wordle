const { getBestGuess, getSoundGuesses } = require('./wordle');
const { compareWords } = require('./words');

const NUM_TRIES = 6;
const WORD_LENGTH = 5;
const states = {
  EMPTY: 'empty',
  ABSENT: 'absent',
  PRESENT: 'present',
  CORRECT: 'correct',
  TBD: 'tbd',
};
const statesByScore = [states.ABSENT, states.PRESENT, states.CORRECT];
const stateIcons = {
  [states.ABSENT]: '⬛',
  [states.PRESENT]: '🟨',
  [states.CORRECT]: '🟩',
};
const keyboardRows = [
  'q w e r t y u i o p',
  'SPACE a s d f g h j k l SPACE',
  'ENTER z x c v b n m BACK',
];

function createBoard() {
  return Array.from({ length: NUM_TRIES }, () =>
    Array.from({ length: WORD_LENGTH }, () => ({ state: states.EMPTY, value: '' })),
  );
}

function createKeyboard() {
  return keyboardRows.map((row) =>
    row.split(' ').map((key) => ({ value: key, state: states.EMPTY })),
  );
}

function playAI(word, words) {
  let board = createBoard();
  let keyboard = createKeyboard();

  let currentRow = 0;
  do {
    const guess = getBestGuess(words);
    const comparison = compareWords(guess, word);

    for (let i = 0; i < guess.length; i++) {
      board[currentRow][i].value = guess[i];
      board[currentRow][i].state = statesByScore[comparison[i]];
    }

    board = updateBoard(board, currentRow, comparison);
    keyboard = updateKeyboard(keyboard, guess, comparison);

    words = getSoundGuesses(words, guess, comparison);
  } while (!checkGameOver(board, currentRow++));

  return { board, keyboard, lastRow: currentRow };
}

function updateBoard(board, rowIndex, rowValue) {
  const newBoard = [...board];
  for (let i = 0; i < rowValue.length; i++) {
    newBoard[rowIndex][i].state = statesByScore[rowValue[i]];
  }
  return newBoard;
}

function updateKeyboard(keyboard, guess, result) {
  const newKeyboard = [...keyboard];
  for (let i = 0; i < result.length; i++) {
    newKeyboard.forEach((row) => {
      row.forEach((key) => {
        if (key.value === guess.charAt(i)) {
          switch (result[i]) {
            case 2:
              key.state = states.CORRECT;
              break;

            case 1:
              if (key.state !== states.CORRECT) {
                key.state = states.PRESENT;
              }
              break;

            case 0:
              if (key.state !== states.CORRECT && key.state !== states.PRESENT) {
                key.state = states.ABSENT;
              }
              break;

            default:
              break;
          }
        }
      });
    });
  }

  return newKeyboard;
}

function checkGameOver(board, currentRow) {
  return isGameWon(board, currentRow) || currentRow === board.length - 1;
}

function isGameWon(board, currentRow) {
  return board[currentRow].every((cell) => cell.state === states.CORRECT);
}

function getShareText(board, aiBoard, wordIndex, lastRow, lastAiRow) {
  const score = lastRow === board.length && !isGameWon(board, lastRow - 1) ? 'X' : lastRow;
  const aiScore =
    lastAiRow === aiBoard.length && !isGameWon(aiBoard, lastAiRow - 1) ? 'X' : lastAiRow;

  let text = `Wordle vs AI ${wordIndex} ${score}/${board.length} - ${aiScore}/${aiBoard.length}\n`;

  for (let i = 0; i < Math.max(lastRow, lastAiRow); i++) {
    for (const cell of board[i]) {
      if (cell.state === states.EMPTY) {
        break;
      }
      text += stateIcons[cell.state];
    }

    text += '  ';

    for (const cell of aiBoard[i]) {
      if (cell.state === states.EMPTY) {
        break;
      }
      text += stateIcons[cell.state];
    }
    text += '\n';
  }

  return text;
}

module.exports = {
  createBoard,
  createKeyboard,
  playAI,
  updateBoard,
  updateKeyboard,
  checkGameOver,
  getShareText,
  states,
};
