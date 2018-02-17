import {Neuron} from "./neuron";

export class Synapse {
    constructor(public weight: number) {}
    leftNeuron: Neuron;
    rightNeuron: Neuron;

    propogate() {

    }

    backpropogate() {

    }
}