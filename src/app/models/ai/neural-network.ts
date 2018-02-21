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
		if (path) {

		} else {
			console.log('Creating new Neural Net');
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
	}

	static relu(x: number): number {
		return Math.max(0, x);
	}

	getMove(boardState: number[]): Move {
		// Create a board with the given state.
		const board: AIBoard = new AIBoard();
		board.setAIBoardState(boardState);

		// Set the value of the input layer neurons.
		for (let i = 1; i < this.inputLayer.neurons.length; ++i) {
			this.inputLayer.neurons[i - 1].value = boardState[i];
		}

		// Activate each of the layers in sequence.
		this.inputLayer.activate();
		for (let i = 0; i < this.hiddenLayers.length; ++i) {
			this.hiddenLayers[i].activate();
		}
		this.outputLayer.activate();

		// Evaluate the output layer to get an answer.
		let move: Move = null;
		let value = -1;
		for (let i = 0; i < this.outputLayer.neurons.length; ++i) {
			const neuron: Neuron = this.outputLayer.neurons[i];
			if (!move || neuron.value > value) {

				// Calculate the move coordinates.
				const fromRow = Math.floor(i / 24);
				const fromCol = i % 24;
				const toRow = fromRow + 1;
				const toCol = fromCol + i % 3 - 1;
				const tempMove = new Move(new Coordinate(fromRow, fromCol), new Coordinate(toRow, toCol));

				// Check if the move is a valid one.
				if (board.isValidMove(tempMove)) {
					move = tempMove;
					value = neuron.value;
				}
			}
		}

		// Train the network.
		this.outputLayer.train();
		for (let i = this.hiddenLayers.length - 1; i >= 0; --i) {
			this.hiddenLayers[i].train();
		}
		this.inputLayer.train();

		console.log(this);
		return move;
	}
}
