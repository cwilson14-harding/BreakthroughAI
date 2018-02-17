import {Layer} from "./layer";

export class NeuralNetwork {
    inputLayer: Layer = new Layer(5);
    hiddenLayer: Layer; // Mean number of input and output layers.
    outputLayer: Layer = new Layer(1536);

    constructor() {}

    static relu(x: number): number {
        return Math.max(0, x);
    }
}