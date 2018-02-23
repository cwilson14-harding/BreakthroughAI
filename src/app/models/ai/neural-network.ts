import {Layer} from './layer';
import {Move} from '../move';
import {Neuron} from './neuron';
import {Coordinate} from '../game-core/coordinate';
import {AIBoard} from './aiboard';

export class NeuralNetwork {
	inputLayer: Layer;
	hiddenLayers: Layer[];
	outputLayer: Layer;
	aiBoard: AIBoard = new AIBoard();

	constructor(network?: number[]) {
		let t0: number;
		console.log('Creating new Neural Net...');
		t0 = performance.now();
		// Create randomized layers.

		// Board size.
		this.inputLayer = new Layer(64);

		// Mean number of input and output layers.
		this.hiddenLayers = [
			new Layer(60),
			new Layer(60)];

		// 64 possible spaces with 3 possible moves each - last layer (end state, can't move from) = 168.
		this.outputLayer = new Layer(168);

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

		// Load the network, if given..
		if (network) {
			console.log(network.length);
			this.loadNetwork(network);
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
			const toRow = move.to.row * -1 + 5;
			const toCol = move.to.column * -1 + 7;
			return new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol));
		}
	}

	showMove(i: number) {
		// Calculate the move coordinates.
		const fromRow = Math.floor(i / 24);
		const fromCol = Math.floor((i % 24) / 3);
		const toRow = fromRow + this.aiBoard.turn * -1;
		const toCol = fromCol + i % 3 - 1;

		// Create the denormalized move.
		const tempMove = NeuralNetwork.denormalizeMove(
			new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol)),
			this.aiBoard.turn
		);

		return tempMove;
	}

	showValidMove(i: number) {
		// Calculate the move coordinates.
		const fromRow = Math.floor(i / 24);
		const fromCol = Math.floor((i % 24) / 3);
		const toRow = fromRow + this.aiBoard.turn * -1;
		const toCol = fromCol + i % 3 - 1;

		// Create the denormalized move.
		const tempMove = NeuralNetwork.denormalizeMove(
			new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol)),
			this.aiBoard.turn
		);

		return (this.aiBoard.isValidMove(tempMove)) ? tempMove : null;
	}

	getValidMoveFromOutputIndex(i: number, aiBoard: AIBoard) {
		const fromRow = Math.floor(i / 24);
		const fromCol = Math.floor((i % 24) / 3);
		const toRow = fromRow + this.aiBoard.turn * -1;
		const toCol = fromCol + i % 3 - 1;

		// Create the denormalized move.
		const tempMove = NeuralNetwork.denormalizeMove(
			new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol)),
			this.aiBoard.turn
		);

		return (aiBoard.isValidMove(tempMove)) ? tempMove : null;
	}

	getMove(boardState: number[]): Move {
		// Create a board with the given state.
		const board: AIBoard = new AIBoard();
		board.setAIBoardState(boardState);

		// Run the input through the network.
		this.setInputWithNormalizedState(board.getNormalizedState(board.turn));
		this.processInput();

		// Get the best move as determined by the network.
		return this.evaluateOutput(board);
	}

	setInputWithNormalizedState(normalizedState: number[]) {
		// Set the value of the input layer neurons.
		for (let i = 0; i < this.inputLayer.neurons.length; ++i) {
			this.inputLayer.neurons[i].value = normalizedState[i];
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
				const toRow = fromRow + board.turn * -1;
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

	trainGame(history: Move[], observeFirst: boolean) {
		console.log('Training game...');
		const board: AIBoard = new AIBoard();
		board.newGame();
		let observe = observeFirst;
		let count = 0;
		for (const move of history) {
			if (observe) {
				// Find the correct output state.
				/*const targetIndex = move.fromIndex * 3;
				// TODO: Normalize the move for output layer training purposes.
				const tempBoard: AIBoard = new AIBoard();
				tempBoard.setAIBoardState(board.getAIBoardState());
				tempBoard.makeMove(move);*/
				const targetOutput = [];
				targetOutput.length = this.outputLayer.neurons.length;
				for (let i = 0; i < this.outputLayer.neurons.length; ++i) {
					const tempMove = this.getValidMoveFromOutputIndex(i, board);
					if (tempMove && move.to.row === tempMove.to.row && move.to.column === tempMove.to.column) {
						targetOutput[i] = 1;
					} else {
						targetOutput[i] = 0;
					}
				}

				// Train until the move is learned.
				this.trainCase(board.getAIBoardState(), targetOutput);

				// OR WAIT TO APPLY TRAINING
				count++;
			}
			board.makeMove(move);
			observe = !observe;
		}
		this.applyTraining(.1);
		this.resetTraining();
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

	saveNetwork(): number[] {
		const result: number[] = [];
		for (const layer of [this.inputLayer, ...this.hiddenLayers]) {
			for (const neuron of layer.neurons) {
				for (const synapse of neuron.rightSynapses) {
					result.push(synapse.weight);
				}
			}
		}
		return result;
	}

	loadNetwork(network: number[]) {
		let i = 0;
		for (const layer of [this.inputLayer, ...this.hiddenLayers]) {
			for (const neuron of layer.neurons) {
				for (const synapse of neuron.rightSynapses) {
					synapse.weight = network[i];
					++i;
				}
			}
		}
	}

	private adjustError(expectedOutput: number[]) {
		// Adjust the error calculations.
		this.outputLayer.adjustError(expectedOutput);
	}
}
