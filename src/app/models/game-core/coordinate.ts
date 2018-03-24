export class Coordinate {
  constructor(public row: number, public column: number) {}
  get index(): number {
    return this.row * 8 + this.column;
  }

  static fromIndex(index: number): Coordinate {
      return new Coordinate(Math.floor(index / 8), index % 8);
  }
}
