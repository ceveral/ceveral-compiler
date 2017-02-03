"use strict";
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}
exports.flatten = flatten;
function isString(a) {
    return typeof a === 'string';
}
exports.isString = isString;
