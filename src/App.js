import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';
import './App.scss';
import words from './data/words.json';
import {
  checkGameOver,
  createBoard,
  createKeyboard,
  getShareText,
  playAI,
  states,
  updateBoard,
  updateKeyboard,
} from './game';
import { compareWords, getRandomWord } from './words';

const emptyBoard = createBoard();
const emptyKeyboard = createKeyboard();
const { word: randomWord, index: randomWordIndex } = getRandomWord(words);
const firstAiGame = playAI(randomWord, words);

function App() {
  const [word, setWord] = useState(randomWord);
  const [wordIndex, setWordIndex] = useState(randomWordIndex);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [board, setBoard] = useState(emptyBoard);
  const [keyboard, setKeyboard] = useState(emptyKeyboard);
  const [isGameOver, setIsGameOver] = useState(false);
  const [aiGame, setAiGame] = useState(firstAiGame);
  const [showAiGame, setShowAiGame] = useState(false);

  const enterKey = useCallback(
    (key) => {
      if (!isGameOver) {
        if (
          key.length === 1 &&
          key.charCodeAt(0) >= 'a'.charCodeAt(0) &&
          key.charCodeAt(0) <= 'z'.charCodeAt(0) &&
          currentColumn < board[0].length
        ) {
          const newBoard = [...board];
          newBoard[currentRow][currentColumn].value = key;
          newBoard[currentRow][currentColumn].state = states.TBD;
          setBoard(newBoard);
          setCurrentColumn(currentColumn + 1);
        } else if (key === 'backspace' && currentColumn > 0) {
          const newBoard = [...board];
          newBoard[currentRow][currentColumn - 1].value = '';
          newBoard[currentRow][currentColumn - 1].state = states.EMPTY;
          setBoard(newBoard);
          setCurrentColumn(currentColumn - 1);
        } else if (key === 'enter') {
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
    const shareText = getShareText(board, aiGame.board, wordIndex, currentRow, aiGame.lastRow);
    copy(shareText);
    alert('Copied results to clipboard');
  };

  return (
    <div id="game">
      <header>
        <div className="title">
          WORDLE <span>vs AI</span>
        </div>
      </header>
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
              <input type="checkbox" onClick={onClickShowAiBoard} checked={showAiGame} /> Show AI
              board
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
