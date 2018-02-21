import {Player} from './player';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';
import {MCTS} from './ai/mcts';
import {NeuralNetwork} from './ai/neural-network';

export class AIPlayer2 implements Player {
  board: GameBoardComponent;
  private resolve: Function;
  private reject: Function;
  // private mcts: MCTS = new MCTS();
  private neuralNetwork = new NeuralNetwork();

  constructor() {}

  getMove(board: GameBoardComponent): Promise<Move> {
    return new Promise<Move>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      const move: Move = this.neuralNetwork.getMove(board.board.getAIBoardState());
      if (move) {
        this.resolve(move);
      } else {
        this.reject();
      }
    });
  }
}
