import {TestBed, inject} from '@angular/core/testing';
import {Move} from '../app/models/move';
import {Coordinate} from '../app/models/game-core/coordinate';
import {NeuralNetwork} from '../app/models/ai/neural-network';

describe('NeuralNetwork', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should correctly denormalize a move from player 1', inject([], () => {
		const move: Move = new Move(new Coordinate(6, 6), new Coordinate(7, 7));
		expect(NeuralNetwork.denormalizeMove(move, -1)).toEqual(move);
	}));

	it('should correctly denormalize a move from player 2', inject([], () => {
		const move: Move = new Move(new Coordinate(6, 7), new Coordinate(7, 6));
		const expectedMove: Move = new Move(new Coordinate(1, 0), new Coordinate(0, 1));
		expect(NeuralNetwork.denormalizeMove(move, 1)).toEqual(expectedMove);
	}));
});