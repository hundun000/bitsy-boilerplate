// insert to hack: edit room from dialog
addDualDialogTag('eraseAllByPointer', function (environment, parameters) {
	var params = parameters[0].split(',');
	var targetId = environment.GetVariable(params[1].trim());
	var roomId = environment.GetVariable(params[2].trim());
	if (targetId == undefined || roomId == undefined) {
		console.log("eraseAllByPointer params point to undefined: " + parameters[0]);
	} else {
		eraseBoxAt(params[0], targetId, 0, 0, bitsy.mapsize - 1, bitsy.mapsize - 1, roomId);
	}
});