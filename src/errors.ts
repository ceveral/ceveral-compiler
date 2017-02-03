import {ExpressionPosition} from './expressions';

export class ValidationError extends Error {
    constructor(public message: string, public errors: any = []) {
        super(message);
        this.name = 'ValidationError';
    }

    toJSON() {

        return {
            name: this.name,
            message: this.message,
            errors: this.errors.map(e => {
                if (e && typeof e.toJSON === 'function') {
                    return e.toJSON();
                }
                return { message: e.message, name: e.name }
            })
        };

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