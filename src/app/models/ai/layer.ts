import {Neuron} from './neuron';

export class Layer {
	neurons: Neuron[];

	constructor(neuronCount: number) {
		this.neurons = [];
		for (let i = 0; i < neuronCount; ++i) {
			this.neurons.push(new Neuron());
		}
	}

	connect(layer: Layer) {
		for (const neuron of this.neurons) {
			for (const foreignNeuron of layer.neurons) {
				neuron.connect(foreignNeuron);
			}
		}
	}

	// Activates a whole layer of neurons.
	activate() {
		for (const neuron of this.neurons) {
			neuron.activate();
		}
	}

	// Train the network
	train() {
		for (const neuron of this.neurons) {
			neuron.train();
		}
	}
}
