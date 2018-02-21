import {Board} from '../models/board';
import {Move} from '../models/move';
import {Coordinate} from '../models/game-core/coordinate';

export class Node {
  constructor(board: Board, public move: Move = null, public parent = null) {
    this.state = board.getBoardState();
  }
  children: Node[] = [];
  state: string;
  p1wins = 0;
  p2wins = 0;
  childrenEvaluated: Boolean = false;

  get turn(): number {
    return +this.state[0];
  }

  get evaluationCount(): number {
    return this.p1wins + this.p2wins;
  }

  getWinRatio(team: number): number {
    if (this.p1wins + this.p2wins === 0) { return 0.5; }
    return ((team === 1) ? (this.p1wins) : (this.p2wins)) / (this.p1wins + this.p2wins);
  }

  // Return all nodes for all the possible moves with this board state.
  getAllChildren(): Node[] {
    // Skip evaluation if we have already gotten all children.
    if (!this.childrenEvaluated) {

      // Create all the children.
      const board: Board = new Board();
      board.setBoardState(this.state);
      for (const move of this.findAllAvailableMoves(board)) {
        // Create the new board configuration.
        const newBoard: Board = new Board();
        newBoard.setBoardState(board.getBoardState());

        // Create new nodes for all the moves.
        newBoard.makeMove(move);
        this.children.push(new Node(newBoard, move, this));
      }

      this.childrenEvaluated = true;
    }

    return this.children;
  }

  findChildWithState(state: string): Node {
    for (const node of this.getAllChildren()) {
      if (node.state === state) {
        return node;
      }
    }
    return null;
  }

  private findAllAvailableMoves(board: Board) {
    const possibleMoves: Move[] = [];

    for (let row = 0; row < Board.BOARD_SIZE; ++row) {
      for (let column = 0; column < Board.BOARD_SIZE; ++column) {
        const startCoordinate: Coordinate = new Coordinate(row, column);
        const moves: Coordinate[] = board.findAvailableMoves(startCoordinate);

        for (let i = 0; i < moves.length; ++i) {
          possibleMoves.push(new Move(startCoordinate, moves[i]));
        }
      }
    }
    return possibleMoves;
  }
}
