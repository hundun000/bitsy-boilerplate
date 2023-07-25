export function getVariableOrPlain(environment, input) {
    if (input.startsWith("*")) {
        const variableId = input.substring(1, input.length);
        const variableValue = environment.GetVariable(variableId);
        if (variableValue == undefined) {
            throw new Error("pointer params point to undefined: " + input);
        }
        return variableValue;
    } else {
        return input;
    }
}


export function getArrayAt(environment, arrayId, dimensionalityIndexs) {
    let key = arrayId;
    for (const index in dimensionalityIndexs) {
        key = key + "_" + index;
    }
    return environment.GetVariable(key);
}

export function setArrayAt(environment, arrayId, dimensionalityIndexs, value) {
    let key = arrayId;
    for (const index in dimensionalityIndexs) {
        key = key + "_" + index;
    }
    return environment.SetVariable(key, value);
}