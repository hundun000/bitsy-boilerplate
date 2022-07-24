/**
🖌
@file edit image from dialog
@summary edit sprites, items, and tiles from dialog
@license MIT
@author Sean S. LeBlanc

@description
You can use this to edit the image data of sprites (including the player avatar), items, and tiles through dialog.
Image data can be replaced with data from another image, and the palette index can be set.

(image "map, target, source")
Parameters:
  map:    Type of image (SPR, TIL, or ITM)
  target: id/name of image to edit
  source: id/name of image to copy

(imageNow "map, target, source")
Same as (image), but applied immediately instead of after dialog is closed.

(imagePal "map, target, palette")
Parameters:
  map:    Type of image (SPR, TIL, or ITM)
  target: id/name of image to edit
  source: palette index (0 is bg, 1 is tiles, 2 is sprites/items, anything higher requires editing your game data to include more)

(imagePalNow "map, target, palette")
Same as (imagePal), but applied immediately instead of after dialog is closed.

Examples:
  (image "SPR, A, a")
  (imageNow "TIL, a, floor")
  (image "ITM, a, b")
  (imagePal "SPR, A, 1")
  (imagePalNow "TIL, floor, 2")

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     It should appear *before* any other mods that handle loading your game
     data so it executes *after* them (last-in first-out).

TIPS:
  - The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
  - You can use the full names or shorthand of image types (e.g. "SPR" and "sprite" will both work)
  - The "source" images don't have to be placed anywhere; so long as they exist in the gamedata they'll work
  - This is a destructive operation! Unless you have a copy of an overwritten image, you won't be able to get it back during that run

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/
import bitsy from 'bitsy';
import { getImageData, setImageData } from '@bitsy/hecks/src/helpers/edit image at runtime';
import { addDualDialogTag, after, addDialogTag } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';
import { getImage } from '@bitsy/hecks/src/helpers/utils';


/* 
 * {var_tgtPointer = "til_UI_1"}
 * {var_srcPointer = "til_digit_4"}
 * (imageByPointerNow "TIL, var_tgtPointer, var_srcPointer")
 * {var_tgtPointer = "til_UI_0"}
 * {var_srcPointer = "til_digit_2"}
 * (imageByPointerNow "TIL, var_tgtPointer, var_srcPointer")
 * til_UI_0's sprite will change to til_digit_2's;
 * til_UI_1's sprite will change to til_digit_4's;
 */
addDialogTag('imageByPointerNow', function (environment, parameters, onReturn) {
    const sprite = bitsy.sprite;
    const curRoom = bitsy.curRoom;
    const x = bitsy.player().x;
    const y = bitsy.player().y;

    for (id in sprite) {
		var spr = sprite[id];
		if (spr.room === curRoom) {
			if (spr.x == x && spr.y == y) {
				return id;
			}
		}
	}
	return onReturn(null);
});