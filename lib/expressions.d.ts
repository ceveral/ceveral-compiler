import { Token, Type } from './tokens';
export interface Position {
    offsert: number;
    line: number;
    column: number;
}
export interface ExpressionPosition {
    start: Position;
    end: Position;
}
export declare abstract class Expression {
    position: ExpressionPosition;
    readonly abstract nodeType: Token;
    toJSON(full?: boolean, human?: boolean): {};
    constructor(position: ExpressionPosition);
    static createPackage(position: ExpressionPosition, args: any[]): PackageExpression;
    static createImport(position: ExpressionPosition, args: any[]): ImportExpression;
    static createRecord(position: ExpressionPosition, args: any[]): RecordExpression;
    static createProperty(position: ExpressionPosition, args: any[]): PropertyExpression;
    static createType(position: ExpressionPosition, args: any[]): TypeExpression;
    static createUserType(position: ExpressionPosition, args: any[]): UserTypeExpression;
    static createOptionalType(position: ExpressionPosition, args: any[]): OptionalTypeExpression;
    static createImportType(position: ExpressionPosition, args: any[]): ImportTypeExpression;
    static createRepeatedType(position: ExpressionPosition, args: any[]): RepeatedTypeExpression;
    static createMapType(position: ExpressionPosition, args: any[]): MapTypeExpression;
    static createAnnotation(position: ExpressionPosition, args: any[]): AnnotationExpression;
    static createService(position: ExpressionPosition, args: any[]): ServiceExpression;
    static createMethod(position: ExpressionPosition, args: any[]): MethodExpression;
    static createAnonymousRecord(position: ExpressionPosition, args: any[]): AnonymousRecordExpression;
    static createNumericEnum(position: ExpressionPosition, args: any[]): NumericEnumExpression;
    static createNumericEnumMember(position: ExpressionPosition, args: any[]): NumericEnumMemberExpression;
    static createStringEnum(position: ExpressionPosition, args: any[]): StringEnumExpression;
    static createStringEnumMember(position: ExpressionPosition, args: any[]): StringEnumMemberExpression;
}
export declare class PackageExpression extends Expression {
    position: ExpressionPosition;
    name: string;
    children: Expression[];
    nodeType: Token;
    fileName: string;
    imports: ImportedPackageExpression[];
    constructor(position: ExpressionPosition, name: string, children: Expression[]);
}
export declare class ImportedPackageExpression extends PackageExpression {
    as: string;
    constructor(p: PackageExpression);
}
export declare class ImportExpression extends Expression {
    position: ExpressionPosition;
    path: string;
    as: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, path: string, as: string);
}
export declare abstract class AnnotatedExpression extends Expression {
    annotations: AnnotationExpression[];
    abstract nodeType: Token;
    constructor(position: ExpressionPosition, annotations: AnnotationExpression[]);
    get(name: string): string;
}
export declare class RecordExpression extends AnnotatedExpression {
    name: string;
    properties: PropertyExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], properties: PropertyExpression[]);
}
export declare class PropertyExpression extends AnnotatedExpression {
    name: string;
    type: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], type: Expression);
}
export declare class TypeExpression extends Expression {
    position: ExpressionPosition;
    type: Type;
    nodeType: Token;
    constructor(position: ExpressionPosition, type: Type);
    toJSON(full?: boolean, human?: boolean): any;
}
export declare class UserTypeExpression extends Expression {
    name: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string);
}
export declare class OptionalTypeExpression extends Expression {
    type: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, type: Expression);
}
export declare class ImportTypeExpression extends Expression {
    packageName: string;
    name: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, packageName: string, name: string);
}
export declare class RepeatedTypeExpression extends Expression {
    type: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, type: Expression);
}
export declare class MapTypeExpression extends Expression {
    key: Expression;
    value: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, key: Expression, value: Expression);
}
export declare class AnnotationExpression extends Expression {
    name: string;
    args: any;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, args: any);
}
export declare class MethodExpression extends AnnotatedExpression {
    name: string;
    parameter: Expression;
    returns: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], parameter: Expression, returns: Expression);
}
export declare class ServiceExpression extends AnnotatedExpression {
    name: string;
    annotations: AnnotationExpression[];
    methods: MethodExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], methods: MethodExpression[]);
}
export declare class AnonymousRecordExpression extends Expression {
    properties: PropertyExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, properties: PropertyExpression[]);
}
export declare class NumericEnumExpression extends AnnotatedExpression {
    name: string;
    annotations: AnnotationExpression[];
    members: NumericEnumMemberExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], members: NumericEnumMemberExpression[]);
}
export declare class NumericEnumMemberExpression extends Expression {
    name: string;
    value: number;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, value: number);
}
export declare class StringEnumExpression extends AnnotatedExpression {
    name: string;
    annotations: AnnotationExpression[];
    members: StringEnumMemberExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], members: StringEnumMemberExpression[]);
}
export declare class StringEnumMemberExpression extends Expression {
    name: string;
    value: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, value: string);
}
export declare function createExpression(type: Token, position: ExpressionPosition, ...args: any[]): Expression;
