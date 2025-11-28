"use strict";

var BREAK;
var CONSTANT;
var FOR;
var GOTO;
var IF;
var LLOAD;
var LOAD;
var LOOP;
var LSTORE;
var SET;
var STORE;
var OPS;

(function() {
    // TODO: Adapt this when we do SSS unescaping.
    var NEWLINE = "\\A/";
    var dumpBuffer = "";
    function dump(s) {
        var start = 0;
        while (true) {
            var index = s.indexOf(NEWLINE, start);
            if (index < 0) {
                dumpBuffer = s.substring(start);
                break;
            }
            console.log("DUMP: " + dumpBuffer + s.substring(start, index));
            dumpBuffer = "";
            start = index + NEWLINE.length;
        }
    }

    function makeOp(func, pops, pushes) {
        func.pops = pops;
        func.pushes = pushes;
        return func;
    }

    BREAK = function BREAK(numLoops) {
        return makeOp(
            function BREAK(state) {
                var i = 1;
                while (i < numLoops) {
                    state.frame.loop = state.frame.loop.enclosing;
                    i++;
                }
                state.frame.pc = state.frame.loop.breakPC;
                state.frame.loop = state.frame.loop.enclosing;
            },
            0,
            0
        );
    };

    /**
     * @param {object} value - the value to push on the stack (see
     * "value.txt").
     */
    CONSTANT = function CONSTANT(value) {
        return makeOp(
            function CONSTANT(state) {
                state.frame.stack.push(value);
            },
            0,
            1
        );
    };

    /** The beginning of a "FOR ... NEXT ... ELSE" structure. */
    FOR = function FOR(loopPC, elsePC, breakPC) {
        return makeOp(
            function FOR(state) {
                var t = state.frame.stack.pop();
                function NEXT(state) {
                    var loopState = state.frame.loop;
                    if (loopState.it === null) {
                        // Exit the loop.
                        state.frame.loop = loopState.enclosing;
                        state.frame.pc = elsePC;
                    } else {
                        // Execute the body of the loop.
                        state.frame.stack.push(loopState.it.key);
                        state.frame.stack.push(loopState.it.value);
                        loopState.it = loopState.it.next();
                        state.frame.pc = loopPC;
                    }
                }
                state.frame.loop = {
                    "loopPC": loopPC,
                    "elsePC": elsePC,
                    "breakPC": breakPC,
                    "enclosing": state.frame.loop,
                    "next": NEXT,
                    "it": valueIterator(t)
                };
                state.frame.loop.next(state);
            },
            1,
            2
        );
    };

    GOTO = function GOTO(targetPC) {
        return makeOp(
            function GOTO(state) {
                state.frame.pc = targetPC;
            },
            0,
            0
        );
    };

    IF = function IF(targetPC) {
        return makeOp(
            function IF(state) {
                var cond = state.frame.stack.pop();
                if (cond.type !== "boolean") {
                    throw (
                        "IF requires a boolean, not '" + valueToString(cond) +
                        "'"
                    );
                }
                if (cond.v === false) {
                    state.frame.pc = targetPC;
                }
            },
            1,
            0
        );
    };

    LLOAD = function LLOAD(index, name) {
        return makeOp(
            function LLOAD(state) {
                var value = state.frame.locals[index];
                // `value === null` is just paranoia. It might be impossible.
                if (typeof value === "undefined" || value === null) {
                    throw (
                        "Local variable " + index + " (" + name +
                        ") not defined"  // The Java version omits "(<name>)"
                    );
                }
                state.frame.stack.push(value);
            },
            0,
            1
        );
    };

    LOAD = function LOAD(index, name) {
        return makeOp(
            function LOAD(state) {
                var value = state.globals[index];
                if (typeof value === "undefined" || value === null) {
                    throw "Global variable " + name + " not defined";
                }
                state.frame.stack.push(value);
            },
            0,
            1
        );
    };

    /** The beginning of a "LOOP ... WHILE ... NEXT ... ELSE" structure. */
    LOOP = function LOOP(loopPC, elsePC, breakPC) {
        return makeOp(
            function LOOP(state) {
                state.frame.loop = {
                    "loopPC": loopPC,
                    "elsePC": elsePC,
                    "breakPC": breakPC,
                    "enclosing": state.frame.loop,
                    "next": function NEXT(state) {
                        state.frame.pc = loopPC;
                    }
                };
                // FIXME: Branch to `loopPC`?
                // state.frame.loop.next(state);
            },
            0,
            0
        );
    };

    LSTORE = function LSTORE(index, name) {
        return makeOp(
            function LSTORE(state) {
                state.frame.locals[index] = state.frame.stack.pop();
            },
            1,
            0
        );
    };

    SET = function SET(name) {
        return makeOp(
            function SET(state) {
                var v = state.frame.stack.pop();
                var o = state.frame.stack.pop();
                if (o.type !== "object") {
                    throw (
                        "Cannot apply SET to " + valueToString(o) +
                        "; an object is required"
                    );
                }
                var old = o.v[name];
                if (typeof old === "undefined" || old.type !== v.type) {
                    throw (
                        "SET " + valueToString(o) + "." + name +
                        " = " + valueToString(v)
                    );
                }
                if (o.objType === "SPRITE") {
                    // We store all touched sprites, and prune invisible ones
                    // at render time.
                    state.visibleSprites[o.objNum] = o;
                }
                o.v[name] = v;
            },
            2,
            0
        );
    };

    STORE = function STORE(index, name) {
        return makeOp(
            function STORE(state) {
                state.globals[index] = state.frame.stack.pop();
            },
            1,
            0
        );
    };

    OPS = {
        "+": makeOp(
            function ADD(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type === "number" && y.type === "number") {
                    state.frame.stack.push(newNumber(x.v + y.v));
                } else if (x.type === "string" && y.type === "string") {
                    state.frame.stack.push(newString(x.v + y.v));
                } else if (x.type === "table" && y.type === "table") {
                    var result = x.v;
                    var it = tableIterator(y.v);
                    while (it !== null) {
                        result = tablePut(result, it.key, it.value);
                        it = it.next();
                    }
                    state.frame.stack.push(newTable(result));
                } else {
                    throw (
                        "Cannot add " + valueToString(x) + " to " +
                        valueToString(y)
                    );
                }
            },
            2,
            1
        ),
        "-": makeOp(
            function SUB(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type === "number" && y.type === "number") {
                    state.frame.stack.push(newNumber(x.v - y.v));
                } else if (x.type === "number" && y.type === "string") {
                    var yStr = y.v;
                    var xInt = x.v | 0;
                    if (xInt !== x.v) {
                        throw valueToString(x) + " is not an integer";
                    }
                    if (xInt < 0 || xInt > yStr.length) {
                        throw (
                            "Cannot remove " + valueToString(x) +
                            " characters from " + valueToString(y) +
                            ": index out of range"
                        );
                    }
                    var result = yStr.substring(xInt);
                    state.frame.stack.push(newString(result));
                } else if (x.type === "string" && y.type === "number") {
                    var xStr = x.v;
                    var yInt = y.v | 0;
                    if (yInt !== y.v) {
                        throw valueToString(y) + " is not an integer";
                    }
                    if (yInt < 0 || yInt > xStr.length) {
                        throw (
                            "Cannot remove " + valueToString(y) +
                            " characters from " + valueToString(x) +
                            ": index out of range"
                        );
                    }
                    var result = xStr.substring(0, xStr.length - yInt);
                    state.frame.stack.push(newString(result));
                } else if (x.type === "table" && y.type === "table") {
                    var result = EMPTY_TABLE;
                    var it = tableIterator(x.v);
                    while (it !== null) {
                        if (tableGet(y.v, it.key) === null) {
                            result = tablePut(result, it.key, it.value);
                        }
                        it = it.next();
                    }
                    state.frame.stack.push(newTable(result));
                } else {
                    throw (
                        "Cannot subtract " + valueToString(y) + " from " +
                        valueToString(x)
                    );
                }
            },
            2,
            1
        ),
        "*": makeOp(
            function MUL(state) {
                function repeatString(string, number) {
                    var count = number.v | 0;
                    if (number.v != count) {
                        throw valueToString(number) + " is not an integer";
                    }
                    if (count < 0) {
                        throw (
                            "Cannot concatenate " + valueToString(number) +
                            " copies of " + valueToString(string)
                        );
                    }
                    var result = "";
                    var unit = string.v;
                    while (count !== 0) {
                        if (count & 1) result += unit;
                        unit += unit;
                        count >>= 1;
                    }
                    return newString(result);
                }
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type === "number" && y.type === "number") {
                    state.frame.stack.push(newNumber(x.v * y.v));
                } else if (x.type === "number" && y.type === "string") {
                    state.frame.stack.push(repeatString(y, x));
                } else if (x.type === "string" && y.type === "number") {
                    state.frame.stack.push(repeatString(x, y));
                } else {
                    throw (
                        "Cannot multiply " + valueToString(x) + " by " +
                        valueToString(y)
                    );
                }
            },
            2,
            1
        ),
        "/": makeOp(
            function DIV(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type === "number" && y.type === "number") {
                    state.frame.stack.push(newNumber(x.v / y.v));
                } else if (x.type === "number" && y.type === "string") {
                    var xInt = x.v | 0;
                    if (xInt !== x.v) {
                        throw valueToString(x) + " is not an integer";
                    }
                    var yStr = y.v;
                    if (xInt < 0 || xInt > yStr.length) {
                        throw (
                            "Cannot keep " + valueToString(x) +
                            " characters from " + valueToString(y) +
                            ": index out of range"
                        );
                    }
                    state.frame.stack.push(
                        newString(yStr.substring(0, xInt))
                    );
                } else if (x.type === "string" && y.type === "number") {
                    var xStr = x.v;
                    var yInt = y.v | 0;
                    if (yInt !== y.v) {
                        throw valueToString(y) + " is not an integer";
                    }
                    if (yInt < 0 || yInt > xStr.length) {
                        throw (
                            "Cannot keep " + valueToString(y) +
                            " characters from " + valueToString(x) +
                            ": index out of range"
                        );
                    }
                    state.frame.stack.push(
                        newString(xStr.substring(xStr.length - yInt))
                    );
                } else if (x.type === "table" && y.type === "table") {
                    var result = EMPTY_TABLE;
                    var it = tableIterator(x.v);
                    while (it !== null) {
                        if (tableGet(y.v, it.key) !== null) {
                            result = tablePut(result, it.key, it.value);
                        }
                        it = it.next();
                    }
                    state.frame.stack.push(newTable(result));
                } else {
                    throw (
                        "Cannot divide " + valueToString(x) + " by " +
                        valueToString(y)
                    );
                }
            },
            2,
            1
        ),
        "%": makeOp(
            function MOD(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type !== "number" || y.type !== "number") {
                    throw (
                        "Cannot apply % to " + valueToString(x) + " and " +
                        valueToString(y) + "; two numbers are required"
                    );
                }
                var result = x.v - y.v * Math.floor(x.v / y.v);
                state.frame.stack.push(newNumber(result));
            },
            2,
            1
        ),
        "**": makeOp(
            function POW(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type !== "number" || y.type !== "number") {
                    throw (
                        "Cannot apply ** to " + valueToString(x) + " and " +
                        valueToString(y) + "; two numbers are required"
                    );
                }
                state.frame.stack.push(newNumber(Math.pow(x.v, y.v)));
            },
            2,
            1
        ),
        "==": makeOp(
            function EQ(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                try {
                    var cmp = compareValues(x, y);
                    state.frame.stack.push(
                        cmp === 0 ? VALUE_TRUE : VALUE_FALSE);
                } catch(err) {
                    state.frame.stack.push(VALUE_FALSE);
                }
            },
            2,
            1
        ),
        "!=": makeOp(
            function NE(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                try {
                    var cmp = compareValues(x, y);
                    state.frame.stack.push(
                        cmp !== 0 ? VALUE_TRUE : VALUE_FALSE);
                } catch(err) {
                    state.frame.stack.push(VALUE_TRUE);
                }
            },
            2,
            1
        ),
        "<>": makeOp(
            function LG(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp !== 0 ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        "<": makeOp(
            function LT(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp < 0 ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        "<=": makeOp(
            function LTE(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp <= 0 ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        ">": makeOp(
            function GT(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp > 0 ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        ">=": makeOp(
            function GTE(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp >= 0 ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        "ABS": makeOp(
            function ABS(state) {
                var x = state.frame.stack.pop();
                if (x.type !== "number") {
                    throw (
                        "Cannot apply ABS to " + valueToString(x) +
                        "; a number is required"
                    );
                }
                state.frame.stack.push(newNumber(Math.abs(x.v)));
            },
            1,
            1
        ),
        "AND": makeOp(
            function AND(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type !== "boolean" || y.type !== "boolean") {
                    throw (
                        "Cannot apply AND to " + valueToString(x) + " and " +
                        valueToString(y) + "; two booleans are required"
                    );
                }
                var result = x.v && y.v;
                state.frame.stack.push(result ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        "CALL": makeOp(
            function CALL(state) {
                var args = state.frame.stack.pop();
                var f = state.frame.stack.pop();
                if (args.type !== "table" || f.type !== "function") {
                    throw (
                        "Can't call " + valueToString(f) +
                        " as a function (passing " + valueToString(args) + ")"
                    );
                }
                state.frame = newStackFrame(f, state.frame);
                state.frame.stack.push(args);
            },
            2,
            1
        ),
        "CEIL": makeOp(
            function CEIL(state) {
                var x = state.frame.stack.pop();
                if (x.type !== "number") {
                    throw (
                        "Cannot apply CEIL to " + valueToString(x) +
                        "; a number is required"
                    );
                }
                state.frame.stack.push(newNumber(-Math.floor(-x.v)));
            },
            1,
            1
        ),
        "CLS": makeOp(
            function CLS(state) {
                for (var spriteNum in state.visibleSprites) {
                    var sprite = state.visibleSprites[spriteNum];
                    sprite.v.IsVisible = VALUE_FALSE;
                }
            },
            0,
            0
        ),
        "CONTAINS": makeOp(
            function CONTAINS(state) {
                var k = state.frame.stack.pop();
                var t = state.frame.stack.pop();
                var result;
                if (t.type === "string") {
                    if (k.type === "number") {
                        var index = k.v | 0;
                        result = (
                            k.v === index && index >= 0 && index < t.v.length
                        );
                    } else {
                        result = false;
                    }
                } else if (t.type === "table") {
                    result = tableGet(t.v, k) !== null;
                } else if (t.type === "object") {
                    result = (typeof t.v[k.v]) !== "undefined";
                } else {
                    throw "Type error: cannot subscript " + valueToString(t);
                }
                state.frame.stack.push(result ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        "DGET": makeOp(
            function DGET(state) {
                var k = state.frame.stack.pop();
                var t = state.frame.stack.pop();
                if (t.type === "table") {
                    var v = tableGet(t.v, k);
                    if (v === null) {
                        throw (
                            valueToString(t) + "[" + valueToString(k) +
                            "] is not defined"
                        );
                    }
                    state.frame.stack.push(t);
                    state.frame.stack.push(k);
                    state.frame.stack.push(v);
                } else {
                    // This instruction is only used to implement assignment
                    // to a value in a table.
                    throw (
                        "Cannot assign to " + valueToString(t) + "[" +
                        valueToString(k) + "]; a table is required"
                    );
                }
            },
            2,
            3
        ),
        "DROP": makeOp(
            function DROP(state) {
                state.frame.stack.pop();
            },
            1,
            0
        ),
        "DROPTABLE": makeOp(
            function DROPTABLE(state) {
                var value = state.frame.stack.pop();
                if (value.type !== "table" || tableSize(value.v) !== 0) {
                    throw (
                        "A function can be called as a subroutine only if " +
                        "it returns [] (the empty table)"
                    );
                }
            },
            1,
            0
        ),
        "DUMP": makeOp(
            function DUMP(state) {
                var value = state.frame.stack.pop();
                if (value.type === "string") {
                    dump(value.v);
                } else {
                    dump(valueToLongString(value));
                }
            },
            1,
            0
        ),
        "END": makeOp(
            function END(state) {
                throw "END";
            },
            0,
            0
        ),
        "FALSE": CONSTANT(VALUE_FALSE),
        "FLOOR": makeOp(
            function FLOOR(state) {
                var x = state.frame.stack.pop();
                if (x.type !== "number") {
                    throw (
                        "Cannot apply FLOOR to " + valueToString(x) +
                        "; a number is required"
                    );
                }
                state.frame.stack.push(newNumber(Math.floor(x.v)));
            },
            1,
            1
        ),
        "GET": makeOp(
            function GET(state) {
                var k = state.frame.stack.pop();
                var t = state.frame.stack.pop();
                var result;
                if (t.type === "string") {
                    if (k.type !== "number") {
                        throw (
                            "Cannot subscript " + valueToString(t) +
                            " by " + valueToString(k)
                        );
                    }
                    var index = k.v | 0;
                    if (index != k.v) {
                        throw (
                            "String subscript must be an integer, not " +
                            valueToString(k)
                        );
                    }
                    if (index >= 0 && index < t.v.length) {
                        result = newString(t.v.substring(index, index + 1));
                    } else {
                        throw (
                            "IndexOutOfBoundsException: " +
                            "String index out of range: " + index
                        );
                    }
                } else if (t.type === "table") {
                    result = tableGet(t.v, k);
                } else if (t.type === "object") {
                    if (k.type !== "string") {
                        throw (
                            "Cannot subscript " + valueToString(t) +
                            " by " + valueToString(k)
                        );
                    }
                    result = t.v[k.v];
                } else {
                    throw "Cannot subscript " + valueToString(t);
                }
                if (typeof result === "undefined" || result === null) {
                    throw (
                        valueToString(t) + "[" + valueToString(k) + "]" +
                        " is not defined"
                    );
                }
                state.frame.stack.push(result);
            },
            2,
            1
        ),
        "KEYS": makeOp(
            function KEYS(state) {
                var result = state.platform.getKeys();
                state.frame.stack.push(newTable(result));
            },
            0,
            1
        ),
        "LEN": makeOp(
            function LEN(state) {
                var x = state.frame.stack.pop();
                if (x.type === "string") {
                    state.frame.stack.push(newNumber(x.v.length));
                } else if (x.type === "table") {
                    state.frame.stack.push(newNumber(tableSize(x.v)));
                } else {
                    throw "Cannot apply LEN to " + valueToString(x);
                }
            },
            1,
            1
        ),
        "MAX": makeOp(
            function MAX(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp > 0 ? x : y);
            },
            2,
            1
        ),
        "MIN": makeOp(
            function MIN(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                var cmp = compareValues(x, y);
                state.frame.stack.push(cmp < 0 ? x : y);
            },
            2,
            1
        ),
        "NEG": makeOp(
            function NEG(state) {
                var x = state.frame.stack.pop();
                if (x.type === "number") {
                    state.frame.stack.push(newNumber(-x.v));
                } else if (x.type === "string") {
                    // TODO: Proper unicode.
                    state.frame.stack.push(
                        newString(x.v.split("").reverse().join("")));
                } else {
                    throw "Cannot negate " + valueToString(x);
                }
            },
            1,
            1
        ),
        "NEXT": makeOp(
            function NEXT(state) {
                state.frame.loop.next(state);
            },
            0,
            0
        ),
        "NOT": makeOp(
            function NOT(state) {
                var x = state.frame.stack.pop();
                if (x.type === "boolean") {
                    state.frame.stack.push(x.v ? VALUE_FALSE : VALUE_TRUE);
                } else {
                    throw (
                        "Cannot apply NOT to " + valueToString(x) +
                        "; a boolean is required"
                    );
                }
            },
            1,
            1
        ),
        "OR": makeOp(
            function OR(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type !== "boolean" || y.type !== "boolean") {
                    throw (
                        "Cannot apply OR to " + valueToString(x) + " and " +
                        valueToString(y) + "; two booleans are required"
                    );
                }
                var result = x.v || y.v;
                state.frame.stack.push(result ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        ),
        "PUT": makeOp(
            function PUT(state) {
                var stack = state.frame.stack;
                var v = stack.pop();
                var k = stack.pop();
                var t = stack.pop();
                if (TYPE_INDEX[k.type] > 5) {
                    throw (
                        "'" + valueToString(k) +
                        "' cannot be used as key in a table"
                    );
                }
                if (t.type !== "table") {
                    throw "'" + valueToString(t) + "' is not a table";
                }
                var result = tablePut(t.v, k, v);
                stack.push(newTable(result));
            },
            3,
            1
        ),
        "RANDOM": makeOp(
            function RANDOM(state) {
                // TODO: We should rethink this API with cryptographic
                // randomness in mind. (JS numbers don't have enough bits).
                state.frame.stack.push(newNumber(Math.random()));
            },
            0,
            1
        ),
        "RETURN": makeOp(
            function RETURN(state) {
                var result = state.frame.stack.pop();
                state.frame = state.frame.caller;
                state.frame.stack.push(result);
            },
            1,
            0
        ),
        "ROUND": makeOp(
            function ROUND(state) {
                var x = state.frame.stack.pop();
                if (x.type !== "number") {
                    throw (
                        "Cannot apply ROUND to " + valueToString(x) +
                        "; a number is required"
                    );
                }
                state.frame.stack.push(newNumber(Math.round(x.v)));
            },
            1,
            1
        ),
        "SPRITE": makeOp(
            function SPRITE(state) {
                var picture = state.frame.stack.pop();
                if (picture.type !== "picture") {
                    throw (
                        "Cannot apply SPRITE " + valueToString(picture) +
                        "; a picture is required"
                    );
                }
                var sprite = newObject(
                    "SPRITE",  // Shown in long string representation.
                    {
                        "X": newNumber(0),
                        "Y": newNumber(0),
                        "W": newNumber(picture.v.width),
                        "H": newNumber(picture.v.height),
                        "Depth": newNumber(0),
                        "Picture": picture,
                        "IsVisible": VALUE_FALSE
                    }
                );
                state.frame.stack.push(sprite);
            },
            1,
            1
        ),
        "SQRT": makeOp(
            function SQRT(state) {
                var x = state.frame.stack.pop();
                if (x.type === "number") {
                    if (x.v < 0) {
                        throw (
                            "Cannot square root negative number " +
                            valueToString(x)
                        );
                    }
                    state.frame.stack.push(newNumber(Math.sqrt(x.v)));
                } else {
                    throw "Cannot square root " + valueToString(x);
                }
            },
            1,
            1
        ),
        "TABLE": CONSTANT(newTable(EMPTY_TABLE)),
        "TRUE": CONSTANT(VALUE_TRUE),
        "WAIT": makeOp(
            function WAIT(state) {
                throw "WAIT";
            },
            0,
            0
        ),
        "WHILE": makeOp(
            function WHILE(state) {
                var cond = state.frame.stack.pop();
                if (cond.type !== "boolean") {
                    throw (
                        "Cannot execute WHILE " + valueToString(cond) +
                        "; a boolean is required"
                    );
                }
                if (cond.v === false) {
                    state.frame.pc = state.frame.loop.elsePC;
                    state.frame.loop = state.frame.loop.enclosing;
                }
            },
            1,
            0
        ),
        "WINDOW": makeOp(
            function WINDOW(state) {
                state.frame.stack.push(state.window);
            },
            0,
            1
        ),
        "XOR": makeOp(
            function XOR(state) {
                var y = state.frame.stack.pop();
                var x = state.frame.stack.pop();
                if (x.type !== "boolean" || y.type !== "boolean") {
                    throw (
                        "Cannot apply XOR to " + valueToString(x) + " and " +
                        valueToString(y) + "; two booleans are required"
                    );
                }
                var result = x.v ^ y.v;
                state.frame.stack.push(result ? VALUE_TRUE : VALUE_FALSE);
            },
            2,
            1
        )
    };
})();
