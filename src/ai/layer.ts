import {Neuron} from "./neuron";

export class Layer {
    neurons: Neuron[];

    constructor(neuronCount: number) {
        this.neurons = [];
        for (let i = 0; i < neuronCount; ++i) {
            this.neurons.push(new Neuron());
        }
    }

    connect(layer: Layer) {

    }
}