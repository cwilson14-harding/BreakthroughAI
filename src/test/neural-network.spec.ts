import {TestBed, inject} from '@angular/core/testing';
import {Move} from '../app/models/move';
import {Coordinate} from '../app/models/game-core/coordinate';
import {NeuralNetwork} from '../app/models/ai/neural-network';
import {AIBoard} from '../app/models/ai/aiboard';

describe('NeuralNetwork', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({});
	});
	const neuralNetwork: NeuralNetwork = new NeuralNetwork();

	it('should set the input layer', inject([], () => {
		const state = [1,
			-1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, 1,
			0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0,
			1, 1, 1, 1, 1, 1, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1
		];
		const board: AIBoard = new AIBoard();
		board.setAIBoardState(state);
		const normalizedState = board.getNormalizedState(board.turn);
		neuralNetwork.setInputWithNormalizedState(normalizedState);
		let valid = true;
		for (let i = 0; i < neuralNetwork.inputLayer.neurons.length && valid; ++i) {
			const value = neuralNetwork.inputLayer.neurons[i].value;
			if (value !== normalizedState[i + 1]) {
				valid = false;
			}
		}
		expect(valid).toBeTruthy();
	}));
});
