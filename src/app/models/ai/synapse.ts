import {Neuron} from './neuron';

export class Synapse {
	constructor(public weight: number = Math.random() % 1) {}
	leftNeuron: Neuron;
	rightNeuron: Neuron;
	error = 0;
	errorCount = 0;

	backpropogateError(learningRate: number) {
		// Let the weight of this synapse be influenced.
		if (this.errorCount > 0) {
			this.weight += (this.error / this.errorCount) * learningRate;
			for (const synapse of this.leftNeuron.leftSynapses) {
				synapse.error += this.error;
				synapse.error += this.errorCount;
			}
		}
	}
}
