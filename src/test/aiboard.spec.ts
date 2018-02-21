import { TestBed, inject } from '@angular/core/testing';
import { AIBoard } from '../app/models/ai/aiboard';
import {Move} from '../app/models/move';
import {Coordinate} from '../app/models/game-core/coordinate';

describe('AIBoard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    });
  });

  it('should be created', inject([], () => {
    expect(new AIBoard()).toBeTruthy();
  }));

  it('should start a new game', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    expect(board.board.length === 64 && board.board[0] === -1 && board.board[63] === 1 && board.turn === -1).toBeTruthy();
  }));

  it('should detect when the game is not over', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    expect(board.isGameOver()).toBe(0);
  }));

  it('should detect valid straight moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(2, 0));
    expect(board.isValidMove(move)).toBeTruthy();
  }));

  it('should detect valid diagonal moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(2, 1));
    expect(board.isValidMove(move)).toBeTruthy();
  }));

  it('should detect invalid straight moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    const state: number[] = [];
    state.length = 65;
    state[0] = -1;
    state[19] = -1;
    state[27] = 1;
    board.setAIBoardState(state);
    const move: Move = new Move(new Coordinate(2, 3), new Coordinate(3, 3));
    expect(board.isValidMove(move)).toBeFalsy();
  }));

  it('should detect invalid team moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    const move: Move = new Move(new Coordinate(6, 7), new Coordinate(5, 7));
    expect(board.isValidMove(move)).toBeFalsy();
  }));

  it('should detect invalid diagonal moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(1, 7));
    expect(board.isValidMove(move)).toBeFalsy();
  }));

  it('should make valid moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    const move: Move = new Move(new Coordinate(1, 0), new Coordinate(2, 0));
    expect(board.makeMove(move) && board.board[move.fromIndex] === 0 && board.board[move.toIndex] === -1 && board.turn === 1).toBeTruthy();
  }));

  it('should not make invalid moves', inject([], () => {
    const board: AIBoard = new AIBoard();
    board.newGame();
    let move: Move = new Move(new Coordinate(0, 0), new Coordinate(1, 1));
    const case1 = board.makeMove(move);
    board.newGame();
    move = new Move(new Coordinate(2, 0), new Coordinate(4, 0));
    const case2 = board.makeMove(move);
    expect(case1 || case2).toBeFalsy();
  }));
});
