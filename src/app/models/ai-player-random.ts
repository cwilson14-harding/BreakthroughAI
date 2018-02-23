import {Player} from './player';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';
import {MCTSRandom} from './ai/mcts-random/mcts-random';

export class AIPlayerRandom implements Player {
  private resolve: Function;
  private reject: Function;

  constructor() {}

  getMove(board: GameBoardComponent): Promise<Move> {
    return new Promise<Move>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const move: Move = MCTSRandom.chooseRandomMove(board.board);
      if (move) {
        this.resolve(move);
      } else {
        this.reject();
      }
    });
  }
}
