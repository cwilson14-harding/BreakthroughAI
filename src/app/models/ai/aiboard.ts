import {Move} from '../move';

export class AIBoard {
  board: number[];
  turn: number;

  constructor() {}

  newGame() {
    this.turn = -1;
    this.board = [];
    this.board.length = 64;
    for (let i = 0; i < 64; ++i) {
      if (i < 16) {
        this.board[i] = -1;
      } else if (i > 48) {
        this.board[i] = 1;
      } else {
        this.board[i] = 0;
      }
    }
  }

  makeMove(move: Move): boolean {
    if (!this.isValidMove(move)) {
      return false;
    }

    this.board[move.toIndex] = this.board[move.fromIndex];
    this.board[move.fromIndex] = 0;
    this.turn *= -1;
    return true;
  }

  isGameOver(): number {
    // Check if player 2 is in the home row.
    for (let i = 0; i < 8; ++i) {
      if (this.board[i] === 1) {
        return 1;
      }
    }

    // Check if player 1 is in the home row.
    for (let i = 63; i >= 56; --i) {
      if (this.board[i] === -1) {
        return -1;
      }
    }

    // Search for pieces left.
    let foundP1 = false;
    let foundP2 = false;
    for (let i = 0; i < 64 && (!foundP1 || !foundP2); ++i) {
      if (this.board[i] === -1) {
        foundP1 = true;
      } else if (this.board[i] === 1) {
        foundP2 = true;
      }
    }

    // Return if a team did not have any pieces left.
    if (foundP1 && !foundP2) {
      return -1;
    } else if (!foundP1 && foundP2) {
      return 1;
    } else {
      return 0;
    }
  }

  isValidMove(move: Move): boolean {
    const fromIndex = move.fromIndex;
    const toIndex = move.toIndex;

    if (this.isGameOver() !== 0) {
      return false;
    }

    // Verify array boundaries.
    if (toIndex >= 64 || toIndex < 0 || fromIndex >= 64 || fromIndex < 0) {
      return false;
    }

    // Verify that we are moving the correct team's piece.
    if (this.board[fromIndex] !== this.turn) {
      return false;
    }

    const row = fromIndex + (8 * this.turn * -1);
    // Verify that the row we are moving to is the next row.
    if (Math.floor(toIndex / 8) !== Math.floor(row / 8)) {
      return false;
    }

    // Verify frontal moves are not blocked.
    if (toIndex === fromIndex + 8) {
      return this.board[toIndex] === 0;
    }

    // Verify that diagonal moves are at the correct locations and are not blocked by a friendly piece.
    return (toIndex === row + 1 || toIndex === row - 1) && this.board[toIndex] !== this.turn;
  }

  getState(team: number): number[] {
    // Returns the state from the given perspective, which normalizes it.
    if (team === -1) {
      return [this.turn].concat(this.board);
    } else {
      const result: number[] = [team];
      for (let i = this.board.length - 1; i >= 0; --i) {
        result.push((this.board[i] === -1) ? 1 : -1);
      }
      return result;
    }
  }

  setGUIBoardState(state: string) {
    this.turn = (state[0] === '1') ? -1 : 1;
    this.board = [];
    this.board.length = 64;
    for (let i = 1; i < state.length; ++i) {
      this.board[i - 1] = +state[i];
    }
  }

  setAIBoardState(state: number[]) {
    this.turn = state[0];
    this.board = state.slice(1);
  }
}
