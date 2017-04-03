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
function Defered(fn) {
    let o = { promise: null, resolve: null, reject: null };
    o.promise = new Promise((resolve, reject) => {
        o.reject = reject;
        o.resolve = resolve;
    });
    if (fn)
        o.promise.then(fn);
    return o;
}
exports.Defered = Defered;
class Once {
    constructor(fn) {
        this.fn = fn;
        this._fns = [];
        this._hasRun = false;
    }
    call() {
        if (this._hasRun)
            return Promise.resolve(this._value);
        let d = Defered();
        this._fns.push(d);
        // If the cb list already is containing a callback, 
        // the initialzer function is already running and we don't 
        // wants to run it again
        if (this._fns.length > 1)
            return d.promise;
        const done = () => {
            this._hasRun = true;
            let fn = this._error == null ? (m) => { m.resolve(this._value); } : (m) => { m.reject(this._error); };
            this._fns.forEach(fn);
            this._fns = [];
        };
        process.nextTick(() => {
            Promise.resolve(this.fn()).then(v => {
                this._value = v;
                done();
            }).catch(e => {
                this._error = e;
                done();
            });
        });
        return d.promise;
    }
}
exports.Once = Once;
