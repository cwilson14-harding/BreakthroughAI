import { Coordinate } from '../app/models/game-core/coordinate';
import {Board} from '../app/models/board';
import {inject} from '@angular/core/testing';
import {Move} from '../app/models/move';
import {AIBoard} from '../app/models/ai/aiboard';

describe('GameBoard', function () {
    it('approves given location', function() {
        const board: Board = new Board();
        const location: Coordinate = new Coordinate(2, 3);
        const isValidated: boolean = board.isLocationValid(location);
        expect(isValidated).toBeTruthy();
    });



  it('should be created', inject([], () => {
    expect(new Board()).toBeTruthy();
  }));

  it('should start a new game', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    expect(board.board.length === 8 && board.board[0].length === 8 && board.board[0][0] === 1 && board.board[7][7] === 2 && board.playerTurn === 1).toBeTruthy();
  }));

  it('should detect when the game is not over', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    expect(board.isGameFinished()).toBe(0);
  }));

  it('should detect valid straight moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(2, 0));
    expect(board.isMoveValid(move)).toBeTruthy();
  }));

  it('should detect valid diagonal moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(2, 1));
    expect(board.isMoveValid(move)).toBeTruthy();
  }));

  it('should detect invalid straight moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    const state: string = board.getBoardState();
    let newState = '';
    for (let i = 0; i < state.length; ++i) {
      if (i === 0) {
        newState += '1';
      } else if (i === 19) {
        newState += '1';
      } else if (i === 27) {
        newState += '2';
      } else {
        newState += state[i];
      }
    }
    board.setBoardState(newState);
    const move: Move = new Move(new Coordinate(2, 3), new Coordinate(3, 3));
    expect(board.isMoveValid(move)).toBeFalsy();
  }));

  it('should detect invalid diagonal moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(1, 7));
    expect(board.isMoveValid(move)).toBeFalsy();
  }));

  it('should make valid moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(2, 0));
    expect(board.makeMove(move) && board.board[move.from.row][move.from.column] === 0 && board.board[move.to.row][move.to.column] === 1 && board.playerTurn === 2).toBeTruthy();
  }));

  it('should not make invalid moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    let move: Move = new Move(new Coordinate(0, 0), new Coordinate(1, 1));
    const case1 = board.makeMove(move);
    board.newGame();
    move = new Move(new Coordinate(2, 0), new Coordinate(4, 0));
    const case2 = board.makeMove(move);
    expect(case1 || case2).toBeFalsy();
  }));

  it('should detect invalid team moves', inject([], () => {
    const board: Board = new Board();
    board.newGame();
    const move: Move = new Move(new Coordinate(6, 7), new Coordinate(5, 7));
    expect(board.isMoveValid(move)).toBeFalsy();
  }));
});
