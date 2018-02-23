import {Player} from './player';
import {GameBoardComponent} from '../game-board/game-board.component';
import {Move} from './move';
import {MCTS} from './ai/mcts';
import {NeuralNetwork} from './ai/neural-network';
import {AIBoard} from './ai/aiboard';
import {ProjectZenCore} from './ai/project-zen-core';
import {MCTSProjectZen} from './ai/mcts-project-zen';

export class AIMCTSProjectZen implements Player {
	board: GameBoardComponent;
	private resolve: Function;
	private reject: Function;
	neuralNetwork: NeuralNetwork;
	mcts: MCTSProjectZen;

	constructor(network?: NeuralNetwork) {
		this.neuralNetwork = (network) ? network : new NeuralNetwork(ProjectZenCore.PROJECT_ZEN_CORE);
		this.mcts = new MCTSProjectZen(this.neuralNetwork);
	}

	getMove(board: GameBoardComponent): Promise<Move> {
		return new Promise<Move>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
			this.mcts.updateBoard(board.board);
			this.mcts.startSearch();
			this.mcts.stopSearch();
			const move: Move = this.mcts.getMove();
			if (move) {
				this.resolve(move);
			} else {
				this.reject();
			}
		});
	}
}
