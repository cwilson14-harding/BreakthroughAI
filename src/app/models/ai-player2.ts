import {Player} from './player';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';
import {MCTS} from './ai/mcts';
import {NeuralNetwork} from './ai/neural-network';
import {AIBoard} from './ai/aiboard';

export class AIProjectZen implements Player {
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
			setTimeout(() => {
			const move: Move = this.neuralNetwork.getMove(board.board.getAIBoardState());
			if (move) {
				this.resolve(move);
			} else {
				this.reject();
			}}, 100);
		});
	}

	train(history: Move[], wentFirst: boolean) {
		const board: AIBoard = new AIBoard();
		board.newGame();
		let observe = !wentFirst;
		for (const move of history) {
			if (observe) {
				// Find the correct output state.
				const targetIndex = move.fromIndex * 3;
				// TODO: Normalize the move for output layer training purposes.


				// Train until the move is learned.
				/*while (this.neuralNetwork.getMove(board.getAIBoardState()) !== move) {
					this.neuralNetwork.trainCase(board.getAIBoardState(), targetIndex);
					this.neuralNetwork.applyTraining(.1);
				}*/
			}

			board.makeMove(move);
			observe = !observe;
		}
	}
}
