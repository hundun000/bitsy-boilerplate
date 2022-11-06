import bitsy from 'bitsy';
import { addDualDialogTag } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';

addDualDialogTag('randomVarArray', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[1].trim();
    var varArraySize = Number(params[2].trim());
    var max = Number(params[3].trim());

    for (var i = 0; i < varArraySize; i++) {
        var key = varArrayName + "_" + i;
        var value = Math.floor(Math.random() * max);
        environment.SetVariable(key, value)
    }
});

addDualDialogTag('random2DVarArray', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[0].trim();
    var varArrayWidth = Number(params[1].trim());
    var varArrayHeight = Number(params[2].trim());
    var max = Number(params[3].trim());
    
    for (var x = 0; x < varArrayWidth; x++) {
        for (var y = 0; y < varArrayHeight; y++) {
            var key = varArrayName + "_" + x + "_" + y;
            var value = Math.floor(Math.random() * max);
            environment.SetVariable(key, value)
        }
    }
});