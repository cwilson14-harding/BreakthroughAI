import {Coordinate} from './game-core/coordinate';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';

export interface Player {
  getMove(board: GameBoardComponent): Promise<Move>;
}
