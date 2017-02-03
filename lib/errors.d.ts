import { ExpressionPosition } from './expressions';
export declare class ValidationError extends Error {
    message: string;
    errors: any;
    constructor(message: string, errors?: any);
    toJSON(): {
        name: string;
        message: string;
        errors: any;
    };
}
export declare class AnnotationValidationError extends Error {
    message: string;
    location: ExpressionPosition;
    expected: string;
    found: string;
    constructor(message: string, location: ExpressionPosition, expected: string, found: string);
    toJSON(): {
        name: string;
        message: string;
        location: ExpressionPosition;
        found: string;
        expected: string;
    };
}
