import {Coordinate} from './game-core/coordinate';

export class Move {
  constructor (public from: Coordinate, public to: Coordinate) {}

  get toIndex(): number {
    return this.to.row * 8 + this.to.column;
  }

  get fromIndex(): number {
    return this.from.row * 8 + this.from.column;
  }

  equals(move: Move): boolean {
    return this.from.row === move.from.row &&
        this.from.column === move.from.column &&
        this.to.row === move.to.row &&
        this.to.column === move.to.column;
  }
}
