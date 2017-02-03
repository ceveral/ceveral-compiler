"use strict";
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
