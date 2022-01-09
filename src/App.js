import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';
import './App.scss';
import words from './data/words.json';
import { getBestGuess, updateGuessResult } from './wordle';
import { compareWords, getRandomWord } from './words';

const STATES = {
  EMPTY: 'empty',
  ABSENT: 'absent',
  PRESENT: 'present',
  CORRECT: 'correct',
};

const numTries = 6;
const wordLength = 5;
function createBoard() {
  return Array.from({ length: numTries }, () =>
    Array.from({ length: wordLength }, () => ({ state: STATES.EMPTY, value: '' })),
  );
}

function createKeyboard() {
  const rows = ['q w e r t y u i o p', 'SPACE a s d f g h j k l SPACE', 'ENTER z x c v b n m BACK'];
  return rows.map((row) => row.split(' ').map((key) => ({ value: key, state: STATES.EMPTY })));
}

function playAI(word, words) {
  let board = createBoard();
  let keyboard = createKeyboard();

  let currentRow = 0;
  let comparison;
  while (
    // can still play
    currentRow < board.length &&
    // and has not found the correct answer
    (!comparison || !comparison.every((val) => val === 2))
  ) {
    const guess = getBestGuess(words);
    comparison = compareWords(guess, word);

    for (let i = 0; i < guess.length; i++) {
      board[currentRow][i].value = guess[i];
    }

    const newBoard = updateBoard(board, currentRow, comparison);
    board = newBoard;

    const newKeyboard = updateKeyboard(keyboard, guess, comparison);
    keyboard = newKeyboard;

    words = updateGuessResult(words, guess, comparison);
    currentRow++;
  }

  return { board, keyboard, lastComparison: comparison, lastRow: currentRow };
}

function updateBoard(board, rowIndex, rowValue) {
  const statesByScore = [STATES.ABSENT, STATES.PRESENT, STATES.CORRECT];
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
              key.state = STATES.CORRECT;
              break;

            case 1:
              if (key.state !== STATES.CORRECT) {
                key.state = STATES.PRESENT;
              }
              break;

            case 0:
              if (key.state !== STATES.CORRECT && key.state !== STATES.PRESENT) {
                key.state = STATES.ABSENT;
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
  return board[currentRow].every((cell) => cell.state === STATES.CORRECT);
}

const stateIcons = { [STATES.ABSENT]: '⬛', [STATES.PRESENT]: '🟨', [STATES.CORRECT]: '🟩' };
function getShareText(board, aiBoard, wordIndex, lastRow, lastAiRow) {
  const score = lastRow === board.length && !isGameWon(board, lastRow - 1) ? 'X' : lastRow;
  const aiScore =
    lastAiRow === aiBoard.length && !isGameWon(aiBoard, lastAiRow - 1) ? 'X' : lastAiRow;

  let text = `Wordle vs AI ${wordIndex} ${score}/${board.length} - ${aiScore}/${aiBoard.length}\n`;

  for (let i = 0; i < Math.max(lastRow, lastAiRow); i++) {
    for (const cell of board[i]) {
      if (cell.state === STATES.EMPTY) {
        break;
      }
      text += stateIcons[cell.state];
    }

    text += '  ';

    for (const cell of aiBoard[i]) {
      if (cell.state === STATES.EMPTY) {
        break;
      }
      text += stateIcons[cell.state];
    }
    text += '\n';
  }

  return text;
}

const emptyBoard = createBoard();
const emptyKeyboard = createKeyboard();
const { word: randomWord, index: randomWordIndex } = getRandomWord(words);
const firstAiGame = playAI(randomWord, words);

function App() {
  const [word, setWord] = useState(randomWord);
  const [wordIndex, setWordIndex] = useState(randomWordIndex);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [board, setBoard] = useState([...emptyBoard]);
  const [keyboard, setKeyboard] = useState([...emptyKeyboard]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [aiGame, setAiGame] = useState(firstAiGame);
  const [showAiGame, setShowAiGame] = useState(false);

  const enterKey = useCallback(
    (key) => {
      if (
        key.length === 1 &&
        key.charCodeAt(0) >= 'a'.charCodeAt(0) &&
        key.charCodeAt(0) <= 'z'.charCodeAt(0) &&
        currentColumn < board[0].length
      ) {
        const newBoard = [...board];
        newBoard[currentRow][currentColumn].value = key;
        setBoard(newBoard);
        setCurrentColumn(currentColumn + 1);
      } else if (key === 'backspace' && currentColumn > 0) {
        const newBoard = [...board];
        newBoard[currentRow][currentColumn - 1].value = '';
        setBoard(newBoard);
        setCurrentColumn(currentColumn - 1);
      } else if (key === 'enter' && !isGameOver) {
        for (const cell of board[currentRow]) {
          if (!cell.value) {
            return;
          }
        }

        const chosenWord = board[currentRow].map((cell) => cell.value).join('');
        if (!words.includes(chosenWord)) {
          alert('Not in word list');
          return;
        }

        const comparison = compareWords(chosenWord, word);
        const newBoard = updateBoard(board, currentRow, comparison);
        setBoard(newBoard);

        setCurrentRow(currentRow + 1);
        setCurrentColumn(0);

        const newKeyboard = updateKeyboard(keyboard, chosenWord, comparison);
        setKeyboard(newKeyboard);

        if (checkGameOver(board, currentRow)) {
          setIsGameOver(true);
        }
      }
    },
    [board, currentRow, currentColumn, isGameOver, keyboard, word],
  );

  useEffect(() => {
    const onKeyPress = (evt) => {
      if (!evt.metaKey && !evt.ctrlKey) {
        enterKey(evt.key.toLocaleLowerCase());
      }
    };

    document.addEventListener('keydown', onKeyPress);
    return () => {
      document.removeEventListener('keydown', onKeyPress);
    };
  }, [enterKey]);

  const onKeyboardPress = (evt) => {
    const key = evt.target.getAttribute('data-key');
    enterKey(parseKeyboardKey(key));
  };

  const parseKeyboardKey = (key) => {
    if (key.length === 1) {
      return key.toLowerCase();
    }
    return { ENTER: 'enter', BACK: 'backspace' }[key];
  };

  const onClickReset = () => {
    const { word: nextWord, index: nextWordIndex } = getRandomWord(words);
    setWord(nextWord);
    setWordIndex(nextWordIndex);
    setAiGame(playAI(nextWord, words));
    setCurrentRow(0);
    setCurrentColumn(0);
    setBoard(createBoard());
    setKeyboard(createKeyboard());
    setIsGameOver(false);
    setShowAiGame(false);
  };

  const onClickShowAiBoard = (evt) => {
    setShowAiGame(evt.target.checked);
  };

  const onClickShare = () => {
    const text = getShareText(board, aiGame.board, 2, currentRow, aiGame.lastRow);
    copy(text);
    alert('Copied results to clipboard');
  };

  return (
    <div id="game">
      <div id="board-container">
        <div id="board" style={{ width: 350, height: 350 }}>
          {(showAiGame ? aiGame.board : board).map((row, rowId) => (
            <div className="row" key={rowId}>
              {row.map((tile, tileId) => (
                <div className="tile" data-state={tile.state} key={tileId}>
                  {tile.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {isGameOver && (
        <div className="toaster" id="game-toaster">
          <div className="toast">{word.toUpperCase()}</div>
        </div>
      )}

      <div id="settings">
        {isGameOver && (
          <>
            <label>
              <input type="checkbox" onClick={onClickShowAiBoard} /> Show AI board
            </label>
            <button onClick={onClickReset}>RESET</button>
            <button onClick={onClickShare} id="force-share-button">
              SHARE
            </button>
          </>
        )}
      </div>

      <div id="keyboard">
        {(showAiGame ? aiGame.keyboard : keyboard).map((row, rowId) => (
          <div className="row" key={rowId}>
            {row.map((key, keyId) => {
              return key.value === 'SPACE' ? (
                <div className="spacer half" key={keyId}></div>
              ) : (
                <button
                  key={keyId}
                  data-key={key.value}
                  data-state={key.state}
                  className={key.value === 'ENTER' || key.value === 'BACK' ? 'one-and-a-half' : ''}
                  onClick={onKeyboardPress}
                >
                  {key.value}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
