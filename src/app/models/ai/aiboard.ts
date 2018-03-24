import {Move} from '../move';
import {Coordinate} from '../game-core/coordinate';

export class AIBoard {
	board: number[];
	turn: number;

	constructor() {
	}

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
		if (toIndex === fromIndex + 8 * this.turn * -1) {
			return this.board[toIndex] === 0;
		}

		// Verify that diagonal moves are at the correct locations and are not blocked by a friendly piece.
		return (toIndex === row + 1 || toIndex === row - 1) && this.board[toIndex] !== this.turn;
	}

	getAIBoardState(): number[] {
		return [this.turn].concat(this.board);
	}

	getNormalizedState(team: number): number[] {
		// Returns the state from the given perspective, which normalizes it.
		if (team === -1) {
			const result: number[] = [];
			for (let i = 0; i < this.board.length; ++i) {
				if (this.board[i] === -1) {
					result.push(1);
				} else if (this.board[i] === 1) {
					result.push(2);
				} else {
					result.push(0);
				}
			}
			return result;
		} else {
			const result: number[] = [];
			for (let i = this.board.length - 1; i >= 0; --i) {
				if (this.board[i] === -1) {
					result.push(2);
				} else if (this.board[i] === 1) {
					result.push(1);
				} else {
					result.push(0);
				}
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

	scoreBoardState(): number {
		// Count the material.
		const pieceMap = [
			5, 15, 15, 5, 5, 15, 15, 5,
			2, 3, 3, 3, 3, 3, 3, 2,
			4, 6, 6, 6, 6, 6, 6, 4,
			7, 10, 10, 10, 10, 10, 10, 7,
			11, 15, 15, 15, 15, 15, 15, 11,
			16, 21, 21, 21, 21, 21, 21, 16,
			20, 28, 28, 28, 28, 28, 28, 20,
			36, 36, 36, 36, 36, 36, 36, 36];
		const board = this.getNormalizedState(this.turn);
		let score = 0;

		const myPieces = [];
		const enemyPieces = [];
		for (let c = 0; c < 64; ++c) {
			if (board[c] === 1) {
				myPieces.push(c);
				score += pieceMap[c];

				// Check reinforcement/threats
				const target: Coordinate = Coordinate.fromIndex(c);
				let stability = 0;

				// Check reinforcing.
				for (const index of [c - 8 - 1, c - 8 + 1]) {
					const other: Coordinate = Coordinate.fromIndex(index);
					if (other.row === target.row - 1 && Math.abs(other.column - target.column) === 1 && other.row >= 0 && board[other.index] === 1) {
						stability++;
					}
				}

				// Check threatening.
				for (const index of [c + 8 - 1, c + 8 + 1]) {
					const other: Coordinate = Coordinate.fromIndex(index);
					if (other.row === target.row + 1 && Math.abs(other.column - target.column) === 1 && other.row < 8 && board[other.index] === 1) {
						stability--;
					}
				}

				score += stability * 10;

			} else if (board[c] === -1) {
				enemyPieces.push(c);
			}
		}

		score += (myPieces.length - enemyPieces.length) * 10;
		

		// TODO: Score board state on potentially capturing moves.
		// TODO: Choose highest scoring move.

		// Return the score.
		return score;
	}
}
