addDialogTag('imageByPointerNow', function (environment, parameters) {
	let params = parameters[0].split(',');
	let mapId = params[0];
	let tgtPointer = params[1].trim();
	let srcPointer = params[2].trim();

	let tgtId = environment.GetVariable(tgtPointer);
	let srcId = environment.GetVariable(srcPointer);

	if (tgtId == undefined || srcId == undefined) {
		throw new Error("pointer params point to undefined: " + parameters[0]);
	}

	parameters[0] = mapId + "," + tgtId + "," + srcId;
	editImage(environment, parameters);
});


addDialogTag('getBitAt', function (environment, parameters, onReturn) {
	let params = parameters[0].split(',');
	let valuePointer = params[0].trim();
	let index = params[1].trim();

	let value = environment.GetVariable(valuePointer);
	if (value == undefined) {
		throw new Error("pointer params point to undefined: " + parameters[0]);
	}

	let result = Math.floor((value - Math.pow(10, index + 1) * Math.floor(value / Math.pow(10, index + 1))) / Math.pow(10, index));

	onReturn(result)
});