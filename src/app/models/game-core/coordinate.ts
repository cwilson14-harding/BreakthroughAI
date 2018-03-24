import {Move} from '../move';

export class Coordinate {
  constructor(public row: number, public column: number) {}
  get index(): number {
    return this.row * 8 + this.column;
  }

  static fromIndex(index: number): Coordinate {
      return new Coordinate(Math.floor(index / 8), index % 8);
  }

  equals(coordinate: Coordinate): boolean {
		return this.row === coordinate.row && this.column === coordinate.column;
	}

	get toString(): string {
		return this.columnToRow() + (this.row + 1);
	}

	private columnToRow(): string {
		switch (this.column) {
			case 0: return 'A';
			case 1: return 'B';
			case 2: return 'C';
			case 3: return 'D';
			case 4: return 'E';
			case 5: return 'F';
			case 6: return 'G';
			case 7: return 'H';
			default: return 'Z';
		}
	}
}
