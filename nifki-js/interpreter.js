"use strict";

/** Constructs a stack frame.
 *
 * @param func the Nifki function object.
 * @param caller the caller's stack frame, or 'null' if this is to be the
 * stack frame of the main program.
 */
function newStackFrame(func, caller) {
    return {
        "caller": caller,
        "pc": func.startPC,
        "locals": [],
        "stack": [],
        "loop": null
    };
}
