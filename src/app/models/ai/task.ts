import {Node} from '../../sign-in/node';

export class Task {
  constructor(public node: Node, public ms: number, public callback?: Function) {}
}
