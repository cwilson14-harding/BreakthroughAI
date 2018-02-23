import {Player} from './player';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';
import {MCTS} from './ai/mcts';
import {NeuralNetwork} from './ai/neural-network';
import {AIBoard} from './ai/aiboard';
import {ProjectZenCore} from './ai/project-zen-core';

export class AIProjectZen implements Player {
	board: GameBoardComponent;
	private resolve: Function;
	private reject: Function;
	neuralNetwork: NeuralNetwork;

	constructor(network?: NeuralNetwork) {
		this.neuralNetwork = (network) ? network : new NeuralNetwork(ProjectZenCore.PROJECT_ZEN_CORE);
	}

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
}
