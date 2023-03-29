// insert to hack: edit image from dialog

/* 
 * {a = 42}
 * (updateNumberImagesNow "TIL, til_UI_, til_digit_, til_digit_empty, 4, a")
 *  
 * Result:
 * til_UI_3's sprite will change to til_digit_empty's;
 * til_UI_2's sprite will change to til_digit_empty's;
 * til_UI_1's sprite will change to til_digit_4's;
 * til_UI_0's sprite will change to til_digit_2's;
 * 
 * if params[6]==true
 * til_UI_3's sprite will change to til_digit_4's;
 * til_UI_2's sprite will change to til_digit_2's;
 * til_UI_1's sprite will change to til_digit_empty's;
 * til_UI_0's sprite will change to til_digit_empty's;
 */
addDialogTag('updateNumberImagesNow', function (environment, parameters) {
	let params = parameters[0].split(',');
	let mapId = params[0];
	let targetIdStart = params[1].trim();
	let sourIdStart = params[2].trim();
	let emptyNumberId = params[3].trim();
	let size = parseInt(params[4].trim());
	let valuePointer = params[5].trim();
	let left = params[6].trim();

	let value = parseInt(environment.GetVariable(valuePointer));
	if (value == undefined) {
		throw new Error("pointer params point to undefined: " + parameters[0]);
	}

	let notEmptyDigitLength = 1;
	let digits = new Array();
	for (let index = 0; index < size; index++) {
		let digit = Math.floor((value - Math.pow(10, index + 1) * Math.floor(value / Math.pow(10, index + 1))) / Math.pow(10, index));
		digits[index] = digit;
		if (digit > 0) {
			notEmptyDigitLength = index + 1;
		}
	}

	for (let index = 0; index < size; index++) {
		let targetId = (targetIdStart + index);
		
		let sourId;
		if (left) {
			if (index >= size - notEmptyDigitLength) {
				sourId = (sourIdStart + digits[index - (size -notEmptyDigitLength)]);
			} else {
				sourId = emptyNumberId;
			}
		} else {
			if (index < notEmptyDigitLength) {
				sourId = (sourIdStart + digits[index]);
			} else {
				sourId = emptyNumberId;
			}
		}
		

		let editImageParameters = [mapId + "," + targetId + "," + sourId];
		editImage(environment, editImageParameters);
	}

});


/* 
 * {var_tgtPointer = "til_UI_1"}
 * {var_srcPointer = "til_digit_4"}
 * (imageByPointerNow "TIL, var_tgtPointer, var_srcPointer")
 * {var_tgtPointer = "til_UI_0"}
 * {var_srcPointer = "til_digit_2"}
 * (imageByPointerNow "TIL, var_tgtPointer, var_srcPointer")
 * 
 * Result:
 * til_UI_0's sprite will change to til_digit_2's;
 * til_UI_1's sprite will change to til_digit_4's;
 */
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

    let editImageParameters = [mapId + "," + tgtId + "," + srcId];
    editImage(environment, editImageParameters);
});
