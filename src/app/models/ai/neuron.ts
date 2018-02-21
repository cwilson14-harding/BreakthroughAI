import {Synapse} from './synapse';

export class Neuron {
	leftSynapses: Synapse[] = [];
	rightSynapses: Synapse[] = [];
	public value = 0;

	constructor() {}

	static relu(x: number): number {
		return Math.max(0, x);
	}

	// Connect two neurons with a synapse.
	connect(neuron: Neuron) {
		// Create the synapse.
		const synapse: Synapse = new Synapse();
		synapse.leftNeuron = this;
		synapse.rightNeuron = neuron;

		// Add the synapse to both neurons.
		this.rightSynapses.push(synapse);
		neuron.leftSynapses.push(synapse);
	}

	// Retrieves values from previous synapses and pushes values onto the next synapses.
	activate() {
		for (const synapse of this.rightSynapses) {
			// Influence the values of the front synapses.
			const targetNeuron = synapse.rightNeuron;
			targetNeuron.value += Neuron.relu(this.value * synapse.weight);
		}
	}

	private backpropogate(learningRate: number, adjustment: number) {
		for (const synapse of this.leftSynapses) {
			// TODO: Influence the values of the synapses.
		}
	}
}
