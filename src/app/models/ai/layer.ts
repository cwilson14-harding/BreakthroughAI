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

	// Clears leftover data from the neurons before activation of the previous layer.
	clear() {
		for (const neuron of this.neurons) {
			neuron.value = 0;
		}
	}

	resetError() {
		// Reset the error of the synapses.
		for (const neuron of this.neurons) {
			for (const synapse of neuron.leftSynapses) {
				synapse.error = 0;
				synapse.errorCount = 0;
			}
		}
	}

	// Train the network. Should only be called on the output layer.
	adjustError(learningRate: number, expectedOutput: number[]) {
		for (let i = 0; i < this.neurons.length; ++i) {
			for (const synapse of this.neurons[i].leftSynapses) {
				synapse.error += expectedOutput[i] - synapse.weight;
				synapse.errorCount++;
			}
		}
	}

	backpropogateError() {
		// Adjust the synapse weights.
		for (const neuron of this.neurons) {
			for (const synapse of neuron.leftSynapses) {
				synapse.weight += synapse.error / synapse.errorCount;
			}
		}
	}
}
