

export function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export function isString(a:any): a is string {
    return typeof a === 'string';
}

export type deferred_cb<T> = () => Promise<T>

export interface deferred<T> {
    promise: Promise<T>;
    resolve: (t: T) => (Promise<T> | T | void)
    reject: (err: Error) => (Promise<T> | T | void)
}

export function Defered<T>(fn?: deferred_cb<T>) {
    let o: deferred<T> = { promise: null, resolve: null, reject: null }
    o.promise = new Promise<T>((resolve, reject) => {
        o.reject = reject;
        o.resolve = resolve;
    });

    if (fn) o.promise.then(fn);

    return o;
}

export class Once<T> {
    private _fns: deferred<T>[] = [];
    private _hasRun = false;
    private _value: T;
    private _error: Error;
    constructor(private fn: () => (Promise<T> | T)) {
    }

    call(): Promise<T> {
        if (this._hasRun) return Promise.resolve(this._value);
        let d = Defered<T>();
        this._fns.push(d);
        // If the cb list already is containing a callback, 
        // the initialzer function is already running and we don't 
        // wants to run it again
        if (this._fns.length > 1) return d.promise;

        const done = () => {
            this._hasRun = true;
            let fn = this._error == null ? (m) => { m.resolve(this._value) } : (m) => { m.reject(this._error) }
            this._fns.forEach(fn);
            this._fns = [];
        }

        process.nextTick(() => {
            Promise.resolve(this.fn()).then(v => {
                this._value = v;
                done();
            }).catch(e => {
                this._error = e;
                done();
            })
        });

        return d.promise;
    }
}