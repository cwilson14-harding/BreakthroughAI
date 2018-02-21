import {Layer} from './layer';
import {Move} from '../move';
import {Neuron} from './neuron';
import {Coordinate} from '../game-core/coordinate';
import {forwardRef} from '@angular/core';
import {AIBoard} from './aiboard';

export class NeuralNetwork {
	inputLayer: Layer = new Layer(65);
	hiddenLayers: Layer[] = [new Layer(40), new Layer(40)]; // Mean number of input and output layers.
	outputLayer: Layer = new Layer(192);

	constructor(path?: string) {
		if (path) {

		} else {
			// Create randomized layers.

			this.inputLayer = new Layer(65);

			// Mean number of input and output layers.
			this.hiddenLayers = [
				new Layer(60),
				new Layer(60)];

			this.outputLayer = new Layer(192);
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
		for (let i = 0; i < this.inputLayer.neurons.length; ++i) {
			this.inputLayer.neurons[i].value = boardState[i];
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

		return move;
	}
}
