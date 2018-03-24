import {TestBed, inject} from '@angular/core/testing';
import {AIBoard} from '../app/models/ai/aiboard';
import {Move} from '../app/models/move';
import {Coordinate} from '../app/models/game-core/coordinate';

describe('Coordinate', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', inject([], () => {
		expect(new Coordinate(1, 1)).toBeTruthy();
	}));

	it('should be output a correct index', inject([], () => {
		expect(new Coordinate(1, 1).index).toBe(9);
	}));

	it('should create a Coordinate given an index', inject([], () => {
		expect(Coordinate.fromIndex(9).equals(new Coordinate(1, 1))).toBeTruthy();
	}));

});
