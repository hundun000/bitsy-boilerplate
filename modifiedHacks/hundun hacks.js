import bitsy from 'bitsy';
import { addDualDialogTag } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';
import { getArrayAt, getVariableOrPlain, setArrayAt } from './helpers/hundun-toolkit';

addDualDialogTag('randomVarArray', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[0].trim();
    var varArraySize = Number(params[1].trim());
    var max = Number(params[2].trim());

    for (var i = 0; i < varArraySize; i++) {
        var value = Math.floor(Math.random() * max);
        setArrayAt(environment, varArrayName, [i], value);
    }
});


/**
 * Usage 0:
 * (setArrayAt "myArray, 0, 42")
 * 
 * Usage 1:
 * {index = 0}
 * {value = 42}
 * (setArrayAt "myArray, *index, *value")
 * 
 * Result:
 * myArray_0 == 42
*/
addDualDialogTag('setArrayAt', function (environment, parameters) {
	const params = parameters[0].split(',');
    const varArrayName = params[0].trim();
    const index = getVariableOrPlain(environment, params[1].trim());
    const value = getVariableOrPlain(environment, params[2].trim());

    return setArrayAt(environment, varArrayName, [index], value);
});

/**
 * Usage 0:
 * {myArray_0 = 42}
 * {print (getArrayAt "myArray, 0")}
 * 
 * Usage 1:
 * {myArray_0 = 42}
 * {index = 0}
 * {print (getArrayAt "myArray, *index")}
 * 
 * Result:
 * print: 42
*/
addDualDialogTag('getArrayAt', function (environment, parameters) {
	const params = parameters[0].split(',');
    const varArrayName = params[0].trim();
    const index = getVariableOrPlain(environment, params[1].trim());

    return getArrayAt(environment, varArrayName, [index]);
});

addDualDialogTag('random2DVarArray', function (environment, parameters) {
	const params = parameters[0].split(',');
    const varArrayName = params[0].trim();
    const varArrayWidth = Number(params[1].trim());
    const varArrayHeight = Number(params[2].trim());
    const max = Number(params[3].trim());
    
    for (let x = 0; x < varArrayWidth; x++) {
        for (let y = 0; y < varArrayHeight; y++) {
            const value = Math.floor(Math.random() * max);
            setArrayAt(environment, varArrayName, [x, y], value)
        }
    }
});

/**
 * Usage:
 * {key = var_a}
 * (setVariableV2 "*key, true, AS_BOOL")
 * 
 * Result: 
 * var_a == true
*/
addDualDialogTag('setVariableV2', function (environment, parameters) {
	const params = parameters[0].split(',');
    const key = getVariableOrPlain(environment, params[0].trim());
    const value = params[1].trim();
    const type = params[2].trim();

    let valueWithType;
    if (type == "AS_NUM") {
        valueWithType = Number(value);
    } else if (type == "AS_BOOL") {
        valueWithType = (value === 'true');
    } else {
        valueWithType = String(value);
    }
    environment.SetVariable(key, valueWithType);
});

/**
 * Usage:
 * {var_a = 42}
 * {value = (compareV2 "*var_a, =, 42")}
 * 
 * Result:
 * value == true
*/
addDualDialogTag('compareV2', function (environment, parameters) {
	const params = parameters[0].split(',');
    const operator1 = getVariableOrPlain(environment, params[0].trim());
    const operation = params[1].trim();
    const operator2 = getVariableOrPlain(environment, params[2].trim());

    let result = false;
    if (operation == "=") {
        result = String(operator1) == String(operator2);
    }
    return result;
});