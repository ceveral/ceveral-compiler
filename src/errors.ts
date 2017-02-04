import {ExpressionPosition} from './expressions';

export class ValidationError extends Error {
    constructor(public message: string, public errors: any[] = []) {
        super(message);
        this.name = 'ValidationError';
    }

    toJSON() {

        return {
            name: this.name,
            message: this.message,
            errors: this.errors.map(e => {
                if (e && typeof (<any>e).toJSON === 'function') {
                    return (<any>e).toJSON();
                }
                return { message: e.message, name: e.name }
            })
        };

    }


    toString() {
        let e = "ValidationError: " + this.message;
        e += '  ' + this.errors.map( m => {
            if (typeof (m as any).toString === 'function') {
                return (m as any).toString();
            }
            return m.message||m;
        }).join('\n  ');
        return e;
    }
}


export class AnnotationValidationError extends Error {
    constructor(public message: string, public location: ExpressionPosition, public expected: string, public found: string) {
        super(message);
        this.name = 'AnnotationValidationError';
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            location: this.location,
            found: this.found,
            expected: this.expected
        };
    }
}