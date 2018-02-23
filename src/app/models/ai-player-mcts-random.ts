import {Player} from './player';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';
import {MCTSRandom} from './ai/mcts-random/mcts-random';

export class AIPlayerMCTSRandom implements Player {
  board: GameBoardComponent;
  private resolve: Function;
  private reject: Function;
  private mcts: MCTSRandom = new MCTSRandom();

  constructor() {}

  getMove(board: GameBoardComponent): Promise<Move> {
    this.mcts.updateBoard(board.board);
    this.mcts.startSearch();

    return new Promise<Move>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      setTimeout(() => {
          this.mcts.stopSearch();
          const move: Move = this.mcts.getMove();
          if (move) {
            this.resolve(move);
          } else {
            this.reject();
          }
        }, 5950);
    });
  }
}
