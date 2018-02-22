import {Layer} from './layer';
import {Move} from '../move';
import {Neuron} from './neuron';
import {Coordinate} from '../game-core/coordinate';
import {AIBoard} from './aiboard';

export class NeuralNetwork {
	inputLayer: Layer;
	hiddenLayers: Layer[];
	outputLayer: Layer;

	constructor(path?: string) {
		let t0: number;
		if (path) {
			console.log('Loading Neural Net from URL...');
			t0 = performance.now();

		} else {
			console.log('Creating new Neural Net...');
			t0 = performance.now();
			// Create randomized layers.

			// 64 possible spaces with 3 possible moves each = 192.
			this.inputLayer = new Layer(64);

			// Mean number of input and output layers.
			this.hiddenLayers = [
				new Layer(60),
				new Layer(60)];

			this.outputLayer = new Layer(192);

			// Connect the layers.
			this.inputLayer.connect(this.hiddenLayers[0]);
			for (let i = 0; i < this.hiddenLayers.length - 1; ++i) {
				this.hiddenLayers[i].connect(this.hiddenLayers[i + 1]);
			}

			// Connect to the output layer.
			if (this.hiddenLayers.length > 0) {
				this.hiddenLayers[this.hiddenLayers.length - 1].connect(this.outputLayer);
			} else {
				this.inputLayer.connect(this.outputLayer);
			}
		}
		const t1 = performance.now();
		console.log('Done. (' + (t1 - t0) + ' ms)');
		console.log(this);
	}

	static denormalizeMove(move: Move, turn: number): Move {
		if (turn === -1) {
			return move;
		} else {
			const fromRow = move.from.row * -1 + 7;
			const fromCol =  move.from.column * -1 + 7;
			const toRow = move.to.row * -1 + 7;
			const toCol = move.to.column * -1 + 7;
			return new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol));
		}
	}

	getMove(boardState: number[]): Move {
		// Create a board with the given state.
		const board: AIBoard = new AIBoard();
		board.setAIBoardState(boardState);

		this.setInputWithNormalizedState(board.getNormalizedState(board.turn));
		this.processInput();

		// Get the best move as determined by the network.
		const move: Move = this.evaluateOutput(board);

		// TODO: Train the network.
		// this.trainNetwork();

		return move;
	}

	private setInputWithNormalizedState(normalizedState: number[]) {
		// Set the value of the input layer neurons.
		for (let i = 1; i < this.inputLayer.neurons.length; ++i) {
			this.inputLayer.neurons[i - 1].value = normalizedState[i];
		}
	}

	private processInput() {
		// Clear all the layers except the input layer.
		for (const layer of this.hiddenLayers) {
			layer.clear();
		}
		this.outputLayer.clear();

		// Activate each of the layers in sequence.
		this.inputLayer.activate();

		for (let i = 0; i < this.hiddenLayers.length; ++i) {
			if (i + 1 < this.hiddenLayers.length) {
				this.hiddenLayers[i + 1].clear();
			}
			this.hiddenLayers[i].activate();
		}
	}

	private evaluateOutput(board: AIBoard): Move {
		// Evaluate the output layer to get an answer.
		let move: Move = null;
		let value = -1;
		for (let i = 0; i < this.outputLayer.neurons.length; ++i) {
			const neuron: Neuron = this.outputLayer.neurons[i];
			if (!move || neuron.value > value) {

				// Calculate the move coordinates.
				const fromRow = Math.floor(i / 24);
				const fromCol = Math.floor((i % 24) / 3);
				const toRow = fromRow + 1;
				const toCol = fromCol + i % 3 - 1;

				// Create the denormalized move.
				const tempMove = NeuralNetwork.denormalizeMove(
					new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol)),
					board.turn
				);

				// Check if the move is a valid one.
				if (board.isValidMove(tempMove)) {
					move = tempMove;
					value = neuron.value;
				}
			}
		}

		return move;
	}

	trainCase(boardState: number[], expectedOutput: number[]) {
		const board: AIBoard = new AIBoard();
		board.setAIBoardState(boardState);

		this.setInputWithNormalizedState(board.getNormalizedState(board.turn));
		this.processInput();

		this.adjustError(expectedOutput);
	}

	applyTraining(learningRate: number) {
		this.outputLayer.backpropogateError(learningRate);
		for (const layer of this.hiddenLayers) {
			layer.backpropogateError(learningRate);
		}
		this.inputLayer.backpropogateError(learningRate);
	}

	resetTraining() {
		this.outputLayer.resetError();
		for (const layer of this.hiddenLayers) {
			layer.resetError();
		}
		this.inputLayer.resetError();
	}

	private adjustError(expectedOutput: number[]) {
		// Adjust the error calculations.
		this.outputLayer.adjustError(expectedOutput);
	}
}
