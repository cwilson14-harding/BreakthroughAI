import {Synapse} from './synapse';

export class Neuron {
	leftSynapses: Synapse[] = [];
	rightSynapses: Synapse[] = [];
	countedValue = 0;
	count = 0;
	get value(): number {
		return (this.count !== 0) ? this.countedValue / this.count : 0;
	}
	set value(value: number) {
		if (value !== 0) {
			this.countedValue = value;
			this.count = 1;
		} else {
			this.countedValue = 0;
			this.count = 0;
		}
	}

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

	activate() {
		for (const synapse of this.rightSynapses) {
			const targetNeuron = synapse.rightNeuron;
			targetNeuron.countedValue += this.value * synapse.weight;
			targetNeuron.count++;
		}
	}
}
