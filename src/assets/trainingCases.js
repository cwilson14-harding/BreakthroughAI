cases = [
[[-1,
-1,-1,-1,-1,-1,-1,-1,-1,
-1,-1,-1,-1,-1,-1,-1,0,
0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,
1,1,1,1,1,1,-1,1,
1,1,1,1,1,1,1,1
],[
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
]]
];

function train() {
  temp1.resetTraining();
  for (var i = 0; i < 1; ++i)
    temp1.trainCase(...cases[0]);
  temp1.applyTraining(.2);
}

function log() {
  console.log(temp1.outputLayer.neurons[0].leftSynapses[0]);
}

function logNodes() {
  var values = [];
  values.length = temp1.outputLayer.neurons.length;
  for (var i = 0; i < temp1.outputLayer.neurons.length; ++i) {
    values[i] = 0;
    for (var j = 0; j < temp1.outputLayer.neurons[i].leftSynapses.length; ++j) {
      values[i] += temp1.outputLayer.neurons[i].leftSynapses[j].weight;
    }
  }
  console.log(values);
}
