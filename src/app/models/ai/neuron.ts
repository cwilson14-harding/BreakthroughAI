import {Synapse} from './synapse';

export class Neuron {
    backSynapses: Synapse[] = [];
    frontSynapses: Synapse[] = [];
    public value: number = Math.random();

    constructor() {}

    // Retrieves values from previous synapses and pushes values onto the next synapses.
    activate() {
      for (const synapse of this.backSynapses) {
        // TODO: Be influenced by the values of the synapses.
      }

      for (const synapse of this.frontSynapses) {
        // TODO: Influence the values of the front synapses.
        synapse.propogate(this.value);
      }
    }

    train() {
      for (const synapse of this.frontSynapses) {
        // TODO: Be influenced by the values of the front synapses.
      }

      for (const synapse of this.backSynapses) {
        // TODO: Influenced the values of the synapses.
        synapse.backpropogate(this.value);
      }
    }
}
