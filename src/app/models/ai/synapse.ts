import {Neuron} from './neuron';

export class Synapse {
	constructor(public weight: number = Math.random() % 1) {}
	leftNeuron: Neuron;
	rightNeuron: Neuron;
	error = 0;
	errorCount = 0;

	propogate(value: number) {
		// TODO: Let the edge value of this synapse be influenced.
	}

	backpropogate(value: number) {
		// TODO: Let the weight of this synapse be influenced.
	}
}
