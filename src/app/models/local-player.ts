import {Player} from './player';
import {Coordinate} from './game-core/coordinate';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';


export class LocalPlayer implements Player {
  selectedCoordinate: Coordinate;
  board: GameBoardComponent;
  team: number;
  private resolve: Function;

  constructor(team: number) {
    this.team = team;
  }

  getMove(board: GameBoardComponent): Promise<Move> {
    this.board = board;
    return new Promise<Move>((resolve, reject) => {
      this.resolve = resolve;
    });
  }

  selectPiece(target: Coordinate) {
    const board: number[][] = this.board.board.board;
    if (this.selectedCoordinate !== undefined && this.selectedCoordinate.row === target.row
      && this.selectedCoordinate.column === target.column) {
      this.selectedCoordinate = undefined;
    } else if (board[target.row][target.column] === this.team) {
      this.selectedCoordinate = target;
    } else if (this.board.board.isMoveValid(new Move(this.selectedCoordinate, target))) {
      // Submit the move if it is valid.
      const coord = this.selectedCoordinate;
      this.selectedCoordinate = undefined;
      this.resolve(new Move(coord, target));
    }
  }
}
