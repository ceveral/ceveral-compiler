"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.message = message;
        this.errors = errors;
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
                return { message: e.message, name: e.name };
            })
        };
    }
    toString() {
        let e = "ValidationError: " + this.message;
        e += '  ' + this.errors.map(m => {
            if (typeof m.toString === 'function') {
                return m.toString();
            }
            return m.message || m;
        }).join('\n  ');
        return e;
    }
}
exports.ValidationError = ValidationError;
class AnnotationValidationError extends Error {
    constructor(message, location, expected, found) {
        super(message);
        this.message = message;
        this.location = location;
        this.expected = expected;
        this.found = found;
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
exports.AnnotationValidationError = AnnotationValidationError;
