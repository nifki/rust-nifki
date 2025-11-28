"use strict";

/*
 * Nifki values are Javascript objects with a "type" field of type String and
 * a "v" field whose type depends on the type. It is the equivalent of the
 * Java type "org.sc3d.apt.crazon.vm.state.Value". The allowed values for the
 * "type" field are exactly as returned by "describeType()" in the Java
 * version, e.g. "number", "string".
 */

var TYPE_INDEX = {
    "boolean": 1,
    "number": 2,
    "string": 3,
    "table": 4,
    "picture": 5,
    "function": 6,
    "object": 7
};

var VALUE_TRUE = {"type": "boolean", "v": true};
var VALUE_FALSE = {"type": "boolean", "v": false};

function newNumber(v) {
    if (typeof v !== "number" || !isFinite(v)) {
        throw "IllegalArgumentException: " + v;
    }
    return {"type": "number", "v": v};
}

function newString(v) {
    if (typeof v !== "string") {
        throw "IllegalArgumentException: " + v;
    }
    return {"type": "string", "v": v};
}

function newPicture(image, originalName) {
    return {"type": "picture", "v": image, "originalName": originalName};
}

function newFunction(startPC, numLocals, originalName) {
    return {
        "type": "function",
        "startPC": startPC,
        "numLocals": numLocals,
        "originalName": originalName
    };
}

var newObject = (function() {
    var objCount = 0;

    function newObject(objType, v) {
        if (typeof v !== "object") {
            throw "IllegalArgumentException: " + v;
        }
        return {
            "type": "object",
            "objType": objType,
            "objNum": objCount++,
            "v": v
        };
    }

    return newObject;
})();

/** `v` is a table as defined in "table.js". */
function newTable(v) {
    if (typeof v !== "object") {
        throw "IllegalArgumentException: " + v;
    }
    return {"type": "table", "v": v};
}

/** Returns negative, zero or positive indicating x < y, x == y, x > y
 * respectively, or throws if x and y are not comparable.
 *
 * If x or y is a function or object, throws an exception. Otherwise,
 * compares their types by their order in TYPE_INDEX. If equal,
 * distinguishes cases according to type:
 * <ul>
 * <li> FALSE is less than TRUE.
 * <li> numbers have the obvious ordering.
 * <li> strings are ordered ASCII-betically.
 * <li> tables are ordered pointwise, considering undefined values to be
 * smaller than defined values. Keys are considered in sorted order. If
 * any of the values is not comparable, then the tables are not
 * comparable.
 * <li> pictures are ordered ASCII-betically on their original variable
 * names (including the page name and underscore).
 * </ul>
 */
// TODO: Test this thoroughly.
function compareValues(x, y) {
    function jsCmp(x, y) {
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
    }
    var xTypeIndex = TYPE_INDEX[x.type];
    var yTypeIndex = TYPE_INDEX[y.type];
    if (xTypeIndex > 5) throw x.type + " is not a comparable type";
    if (yTypeIndex > 5) throw y.type + " is not a comparable type";
    if (xTypeIndex !== yTypeIndex) return xTypeIndex - yTypeIndex;
    if (xTypeIndex < 4) {
        // JavaScript's semantics for boolean/number/string match ours.
        return jsCmp(x.v, y.v);
    }
    if (xTypeIndex === 5) {
        return jsCmp(x.originalName, y.originalName);
    }
    var xKeys = x.v.keys, xValues = x.v.values;
    var yKeys = y.v.keys, yValues = y.v.values;
    var it1 = 0;
    var it2 = 0;
    while (true) {
        if (it1 >= xKeys.length) {
            return it2 >= yKeys.length ? 0 : -1;
        }
        if (it2 >= yKeys.length) {
            return 1;
        }
        var result = -compareValues(xKeys[it1], yKeys[it2]);
        if (result !== 0) {
            return result;
        }
        result = compareValues(xValues[it1], yValues[it2]);
        if (result !== 0) {
            return result;
        }
        it1++;
        it2++;
    }
}

function valueToString(value) {
    var v = value.v;
    if (value.type === "boolean") {
        return v ? "TRUE" : "FALSE";
    } else if (value.type === "number") {
        return "" + v;
    } else if (value.type === "string") {
        // TODO: SSString.encode equivalent.
        return v;
    } else if (value.type === "table") {
        return "TABLE(" + v.keys.length + " keys)";
    } else if (value.type === "picture") {
        return value.originalName;
    } else if (value.type === "function") {
        return value.originalName;
    } else if (value.type === "object") {
        return value.objType + ":" + value.objNum;
    } else {
        return "<TODO: valueToString " + value.type + ">";
    }
}

function valueToLongString(value) {
    var v = value.v;
    var i, result, sep, keys, key;
    if (value.type === "table") {
        result = "[";
        sep = "";
        keys = v.keys;
        var values = v.values;
        for (i=0; i < keys.length; i++) {
            key = keys[i];
            result += (
                sep + valueToString(key) + "=" + valueToString(values[i]));
            sep = ", ";
        }
        return result + "]";
    } else if (value.type === "object") {
        result = valueToString(value) + "(";
        sep = "";
        keys = Object.getOwnPropertyNames(v);
        keys.sort();
        for (i=0; i < keys.length; i++) {
            key = keys[i];
            result += sep + key + "=" + valueToString(v[key]);
            sep = ", ";
        }
        return result + ")";
    } else {
        return valueToString(value);
    }
}

/**
 * Returns an iterator through `value`, which can be a number, a string, or a
 * table. A number `n` behaves like a table that maps `i` to `i` for each
 * `0 <= i < n`. A string `s` of length `n` behaves like a table that maps
 * `i` to `s[i]` for each `0 <= i < n`. Iterating through a table yields its
 * (key, value) pairs in increasing order of key.
 *
 * An iterator is `null` (representing the empty sequence) or an object with
 * the following fields:
 * - key - the next key.
 * - value - the corresponding value.
 * - next - a function that takes no arguments and returns the remaining
 * iterator.
 */
function valueIterator(value) {
    var range = EMPTY_TABLE;
    if (value.type === "number") {
        var d = value.v;
        var n = d | 0;
        if (n !== d) {
            throw d + " is not an integer";
        }
        for (var i=0; i < n; i++) {
            var v = newNumber(i);
            range = tablePut(range, v, v);
        }
    } else if (value.type === "string") {
        var s = value.v;
        for (var i=0; i < s.length; i++) {
            var k = newNumber(i);
            var v = newString(s.substring(i, i+1));
            range = tablePut(range, k, v);
        }
    } else if (value.type === "table") {
        range = value.v;
    } else {
        throw "Can't iterate through " + valueToString(t);
    }
    return tableIterator(range);
}
