"use strict";

// See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
// As noted there, this doesn't really work in general.
var KEY_CODES = {
    // TODO (in Java too): Function keys.
    "Escape": 0x1B,
    "PrintScreen": 0x2C,  // I can't test this, the OS grabs it first.
    "ScrollLock": 0x91,
    "Break": 0x13,  // ="Pause"
    // Typewriter first row.
    "BackQuote": 0xC0,
    "Minus": 0xAD,
    "Equals": 0x3D,
    "BackSpace": 0x08,
    // Typewriter second row.
    "Tab": 0x09,
    "OpenBracket": 0xDB,  // "["/"{"
    "CloseBracket": 0xDD,  // "]"/"}"
    "LeftBrace": 0,  // My keyboard doesn't have this.
    "RightBrace": 0,  // My keyboard doesn't have this.
    "Enter": 0x0D,
    // Typewriter third row.
    "CapsLock": 0x14,
    "Semicolon": 0x3B,
    "Quote": 0xDE,
    "Hash": 0xA3,
    // Typewriter fourth row.
    "Shift": 0x10,
    "BackSlash": 0xDC,
    "Comma": 0xBC,
    "FullStop": 0xBE,
    "Slash": 0xBF,
    // Typewriter fifth row.
    "Control": 0x11,
    "Alt": 0x12,
    "Space": 0x20,
    // Navigation keys.
    "Insert": 0x2D,
    "Home": 0x24,
    "PageUp": 0x21,
    "Delete": 0x2E,
    "End": 0x23,
    "PageDown": 0x22,
    // Arrow keys.
    "DownArrow": 0x28,
    "LeftArrow": 0x25,
    "RightArrow": 0x27,
    "UpArrow": 0x26
    // TODO (in Java too): Numpad.
};

(function() {
    for (var i=0; i < 10; i++) {
        KEY_CODES["Number" + i] = 0x30 + i;
    }
    for (var j=0; j < 26; j++) {
        KEY_CODES["Letter" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j]] = 0x41 + j;
    }
})();

/**
 * Installs a keyboard event listener on `canvas` and returns a function.
 *
 * The returned function takes no arguments and returns the current keyboard
 * state in the form of a table mapping each name in KEY_NAME_VALUES to a
 * Nifki boolean.
 */
function installKeyListener(canvas) {
    // Initially, all keys are unpressed.
    var keyStates = EMPTY_TABLE; // Nifki string to Nifki boolean.
    for (var key in KEY_CODES) {
        keyStates = tablePut(keyStates, newString(key), VALUE_FALSE);
    }
    // Ensure `canvas` is focusable.
    if (typeof canvas.tabIndex !== "number" || canvas.tabIndex < 0) {
        canvas.tabIndex = 0;
    }
    // Install KeyEvent handler.
    function onKeyEvent(event) {
        if (event.defaultPrevented) {
            return;
        }

        if (typeof event.keyCode === "undefined") {
            // We can only handle the "keyCode" attribute for now.
            return;
        }

        var isDown = event.type === "keydown" ? VALUE_TRUE : VALUE_FALSE;
        for (var key in KEY_CODES) {
            if (event.keyCode === KEY_CODES[key]) {
                keyStates = tablePut(keyStates, newString(key), isDown);
                event.preventDefault();  // Consume this key press.
            }
        }
    }
    canvas.addEventListener("keydown", onKeyEvent, true);
    canvas.addEventListener("keyup", onKeyEvent, true);
    // Return a way of getting the latest `keyStates` value.
    return function() { return keyStates; }
}
