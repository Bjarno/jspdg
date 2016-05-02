var util = require('util');
var fs = require("fs");

var tiersplit = require("./tiersplit.js").tiersplit;

var readFile = function readFile(path) {
	return fs.readFileSync(path, "utf-8");
};

var input = readFile("INPUT");

var toGenerate = {
    identifiers: ['tasks', 'newTaskDescription'],
    methodCalls: ['toggleTask', 'addTask']
};

var stip_result = tiersplit(input, 'node.js', toGenerate);
var clientJS = escodegen.generate(stip_result[0].program);
var serverJS = escodegen.generate(stip_result[1].program);

console.log("-------- Client ---------");
console.log(clientJS);

console.log("-------- Server ---------");
console.log(serverJS);