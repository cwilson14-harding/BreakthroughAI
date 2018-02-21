import {Layer} from './layer';
import {Move} from '../move';

export class NeuralNetwork {
    inputLayer: Layer = new Layer(65);
    hiddenLayer: Layer; // Mean number of input and output layers.
    outputLayer: Layer = new Layer(1536);

    constructor() {}

    static relu(x: number): number {
      return Math.max(0, x);
    }

    // TODO: Implement getMove();
    getMove(boardState: number[]): Move {
      // Set the value of the input layer neurons.
      for (let i = 0; i < this.inputLayer.neurons.length; ++i) {
        this.inputLayer.neurons[i].value = boardState[i];
      }

      // Activate each of the layers in sequence.
      this.inputLayer.activate();
      this.hiddenLayer.activate();
      this.outputLayer.activate();

      // Evaluate the output layer to get an answer.
      let move: Move = null;
      for (const neuron of this.outputLayer.neurons) {
        // TODO: Find max value for move.
      }

      // Train the network.
      this.outputLayer.train();
      this.hiddenLayer.train();
      this.inputLayer.train();

      return move;
    }
}
