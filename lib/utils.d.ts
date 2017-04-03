export declare function flatten(arr: any): any;
export declare function isString(a: any): a is string;
export declare type deferred_cb<T> = () => Promise<T>;
export interface deferred<T> {
    promise: Promise<T>;
    resolve: (t: T) => (Promise<T> | T | void);
    reject: (err: Error) => (Promise<T> | T | void);
}
export declare function Defered<T>(fn?: deferred_cb<T>): deferred<T>;
export declare class Once<T> {
    private fn;
    private _fns;
    private _hasRun;
    private _value;
    private _error;
    constructor(fn: () => (Promise<T> | T));
    call(): Promise<T>;
}
