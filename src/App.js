import React, { useState, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard';
import {Chess} from 'chess.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  
  const chessboardRef = useRef();
  const [chessboardSize, setChessboardSize] = useState(undefined);
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');

  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState('');
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  useEffect(() => {
    function handleResize() {
      const display = document.getElementsByClassName('container')[0];
      setChessboardSize(display.offsetWidth - 20);
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();

    // exit if the game is over
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0){
      toast.info("♔ GAME OVER")
      toast.info("THE GAME WILL RESET AFTER 5 SECONDS")
      setTimeout(()=> {game.reset()}, 5000);
    };

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex]);
    });
  }

  function onSquareClick(square) {
    setRightClickedSquares({});

    function resetFirstMove(square) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);

    // if invalid, setMoveFrom and getMoveOptions
    if (move === null) {
      resetFirstMove(square);
      return;
    }

    setTimeout(makeRandomMove, 300);
    setMoveFrom('');
    setOptionSquares({});
  }

  /*function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);

    // illegal move
    if (move === null) return false;

    // store timeout so it can be cleared on undo/reset so computer doesn't execute move
    const newTimeout = setTimeout(makeRandomMove, 200);
    setCurrentTimeout(newTimeout);
    return true;
  }*/

  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }

  return (
    <div className='container'>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeButton={true}
        rtl={false}
        pauseOnHover={true}
        draggable={false}
      />
      <Chessboard
        id="PlayVsRandom"
        animationDuration={200}
        arePiecesDraggable={false}
        boardOrientation={boardOrientation}
        boardWidth={chessboardSize}
        position={game.fen()}
        //onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
          ...rightClickedSquares
        }}
        ref={chessboardRef}
      />
      <div>
        <button
          className="rc-button"
          onClick={() => {
            safeGameMutate((game) => {
              game.reset();
            });
            chessboardRef.current.clearPremoves();
            setMoveSquares({});
            setRightClickedSquares({});
            // stop any current timeouts
            //clearTimeout(currentTimeout);
          }}
        >
          reset
        </button>
        <button
          className="rc-button"
          onClick={() => {
            setBoardOrientation((currentOrientation) => (currentOrientation === 'white' ? 'black' : 'white'));
          }}
        >
          flip board
        </button>
        <button
          className="rc-button"
          onClick={() => {
            safeGameMutate((game) => {
              game.undo();
            });
            chessboardRef.current.clearPremoves();
            setMoveSquares({});
            // stop any current timeouts
            //clearTimeout(currentTimeout);
          }}
        >
          undo
        </button>
      </div>

    </div>
  )
}

export default App
