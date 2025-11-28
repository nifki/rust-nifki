"use strict";

/*
 * A table contains an array of keys and an array of values. Each key and each
 * value is a Nifki value. The keys are comparable and in sorted order.
 */

// TODO: Inject key comparator so as to avoid the dependency on
// `compareValues()`.

var EMPTY_TABLE = {"keys": [], "values": []};

// Helper: Returns the point at which to insert/overwrite the element.
function sortedArrayFind(array, element) {
    var len = array.length;
    var start = 0, end = len;
    while (start < end) {
        var i = (start + end) >> 1;
        if (compareValues(array[i], element) < 0) {
            start = i + 1;
        } else {
            end = i;
        }
    }
    return start;
}

function tableSize(table) {
    return table.keys.length;
}

function tablePut(table, key, value) {
    var keys = table.keys;
    var newKeys = keys.slice();
    var newValues = table.values.slice();
    // Insert/overwrite preserving sorted order.
    var i = sortedArrayFind(keys, key);
    if (i < keys.length && compareValues(keys[i], key) === 0) {
        newKeys[i] = key;
        newValues[i] = value;
    } else {
        // Insert key and value at position `i`.
        newKeys.splice(i, 0, key);
        newValues.splice(i, 0, value);
    }
    return {"keys": newKeys, "values": newValues};
}

function tableGet(table, key) {
    var keys = table.keys;
    var i = sortedArrayFind(keys, key);
    if (i < keys.length && compareValues(keys[i], key) === 0) {
        return table.values[i];
    }
    return null;
}

function tableIterator(table) {
    function newItem(i) {
        if (i >= table.keys.length) {
            return null;
        }
        return {
            "key": table.keys[i],
            "value": table.values[i],
            "next": function next() { return newItem(i+1) }
        };
    }
    return newItem(0);
}
