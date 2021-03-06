
import { Token, Type } from './tokens'

export interface Position {
    offsert: number;
    line: number;
    column: number;
}

export interface ExpressionPosition {
    start: Position;
    end: Position
}

export abstract class Expression {
    abstract readonly nodeType: Token

    toJSON(full: boolean = false, human: boolean = false) {
        if (full === true) return this;
        return Object.keys(this)
            .filter((key) => ['position'].indexOf(key) < 0)
            .reduce((newObj, key) => {
                var val = this[key];
                if (key === "nodeType" && human) {
                    val = Token[val];
                }

                if (val instanceof Expression) {
                    val = val.toJSON(full, human);
                    //return Object.assign(newObj, {[key]: this[key].toJSON(full, human)});
                } else if (Array.isArray(val)) {
                    val = val.map(m => {
                        if (m instanceof Expression) return m.toJSON(full, human);
                        return m;
                    })
                }

                return Object.assign(newObj, { [key]: val })
            }, {})
    }

    constructor(public position:ExpressionPosition) {}

    static createPackage(position: ExpressionPosition, args: any[]) {
        return new PackageExpression(position, args[0], args[1]);
    }

    static createImport(position: ExpressionPosition, args: any[]) {
        return new ImportExpression(position, args[0], args[1]);
    }

    static createRecord(position: ExpressionPosition, args: any[]) {
        return new RecordExpression(position, args[0], args[1], args[2]);
    }

    static createProperty(position: ExpressionPosition, args: any[]) {

        return new PropertyExpression(position, args[0], args[1], args[2]);
    }

    static createType(position: ExpressionPosition, args: any[]) {
        return new TypeExpression(position, args[0]);
    }

    static createUserType(position: ExpressionPosition, args: any[]) {
        return new UserTypeExpression(position, args[0]);
    }

    static createOptionalType(position: ExpressionPosition, args: any[]) {

        return new OptionalTypeExpression(position, args[0]);
    }

    static createImportType(position: ExpressionPosition, args: any[]) {
        return new ImportTypeExpression(position, args[0], args[1]);
    }

    static createRepeatedType(position: ExpressionPosition, args: any[]) {
        return new RepeatedTypeExpression(position, args[0]);
    }

    static createMapType(position: ExpressionPosition, args: any[]) {
        return new MapTypeExpression(position, args[0], args[1]);
    }

    static createAnnotation(position: ExpressionPosition, args: any[]) {
        return new AnnotationExpression(position, args[0], args[1]);
    }

    static createService(position: ExpressionPosition, args: any[]) {
        return new ServiceExpression(position, args[0], args[1], args[2]);
    }

    static createMethod(position: ExpressionPosition, args: any[]) {
        return new MethodExpression(position, args[0], args[1], args[2], args[3]);
    }

    static createAnonymousRecord(position: ExpressionPosition, args: any[]) {
        return new AnonymousRecordExpression(position, args[0]);
    }

    static createNumericEnum(position: ExpressionPosition, args: any[]) {
        return new NumericEnumExpression(position, args[0], args[1], args[2]);
    }

    static createNumericEnumMember(position: ExpressionPosition, args: any[]) {
        return new NumericEnumMemberExpression(position, args[0], args[1]);
    }

    static createStringEnum(position: ExpressionPosition, args: any[]) {
        return new StringEnumExpression(position, args[0], args[1], args[2]);
    }

    static createStringEnumMember(position: ExpressionPosition, args: any[]) {
        return new StringEnumMemberExpression(position, args[0], args[1]);
    }
}

export class PackageExpression extends Expression {
    nodeType = Token.Package;
    fileName: string;
    imports: ImportedPackageExpression[];
    constructor(public position: ExpressionPosition, public name: string, public children: Expression[]) {
        super();
    }

}

export class ImportedPackageExpression extends PackageExpression {
    as: string;
    constructor(p:PackageExpression) {
        super(p.position, p.name, p.children);
        this.imports = p.imports;
        this.fileName = p.fileName;
    }
}

export class ImportExpression extends Expression {
    nodeType = Token.Import;

    constructor(public position: ExpressionPosition, public path: string, public as: string) {
        super(position);
    }
}

export abstract class AnnotatedExpression extends Expression {
    abstract nodeType: Token;
    constructor(position: ExpressionPosition, public annotations: AnnotationExpression[]) {
        super(position);
    }

    // Get annotation argument by name
    public get(name: string): string
    public get<T>(name: string): T {
        let found = this.annotations.find(m => m.name === name)
        return found ? found.args : null;
    }
}

export class RecordExpression extends AnnotatedExpression {
    nodeType = Token.Record;
    constructor(position: ExpressionPosition, public name: string, annotations: AnnotationExpression[], public properties: PropertyExpression[]) {
        super(position, annotations);

    }
}

export class PropertyExpression extends AnnotatedExpression {
    nodeType = Token.Property;
    constructor(position: ExpressionPosition, public name: string, annotations: AnnotationExpression[], public type: Expression) {
        super(position,annotations);
    }

}

export class TypeExpression extends Expression {
    nodeType = Token.PrimitiveType;
    constructor(public position: ExpressionPosition, public type: Type) {
        super(position);
    }

    toJSON(full: boolean = false, human: boolean = false) {
        let json:any = super.toJSON(full, human);
        if (human) json.type = Type[json.type];
        return json;
    }
}

export class UserTypeExpression extends Expression {
    nodeType = Token.UserType;
    constructor(position: ExpressionPosition, public name: string) {
        super(position);
    }
}

export class OptionalTypeExpression extends Expression {
    nodeType = Token.OptionalType;
    constructor(position: ExpressionPosition, public type: Expression) {
        super(position);
    }
}

export class ImportTypeExpression extends Expression {
    nodeType = Token.ImportType;
    constructor(position: ExpressionPosition, public packageName: string, public name: string) {
        super(position);
    }
}

export class RepeatedTypeExpression extends Expression {
    nodeType = Token.RepeatedType;
    constructor(position: ExpressionPosition, public type: Expression) {
        super(position);
    }
}

export class MapTypeExpression extends Expression {
    nodeType = Token.MapType;
    constructor(position: ExpressionPosition, public key: Expression, public value: Expression) {
        super(position);
    }
}

export class AnnotationExpression extends Expression {
    nodeType = Token.Annotation;
    constructor(position: ExpressionPosition, public name: string, public args: any) {
        super(position);
    }
}

export class MethodExpression extends AnnotatedExpression {
    nodeType = Token.Method;
    constructor(position: ExpressionPosition, public name: string, annotations: AnnotationExpression[], public parameter: Expression, public returns: Expression) {
        super(position, annotations);
    }
}

export class ServiceExpression extends AnnotatedExpression {
    nodeType = Token.Service;
    constructor(position: ExpressionPosition, public name: string, public annotations: AnnotationExpression[], public methods: MethodExpression[]) {
        super(position, annotations);
    }
}

export class AnonymousRecordExpression extends Expression {
    nodeType = Token.AnonymousRecord;
    constructor(position: ExpressionPosition, public properties: PropertyExpression[]) {
        super(position);
    }
}

export class NumericEnumExpression extends AnnotatedExpression {
    nodeType = Token.NumericEnum;
    constructor(position: ExpressionPosition, public name: string, public annotations: AnnotationExpression[], public members: NumericEnumMemberExpression[]) {
        super(position, annotations);
    }
}

export class NumericEnumMemberExpression extends Expression {
    nodeType = Token.NumericEnumMember;
    constructor(position: ExpressionPosition, public name: string, public value: number) {
        super(position);
    }
}

export class StringEnumExpression extends AnnotatedExpression {
    nodeType = Token.StringEnum;
    constructor(position: ExpressionPosition, public name: string, public annotations: AnnotationExpression[],  public members: StringEnumMemberExpression[]) {
        super(position, annotations);
    }
}

export class StringEnumMemberExpression extends Expression {
    nodeType = Token.StringEnumMember;
    constructor(position: ExpressionPosition, public name: string, public value: string) {
        super(position);
    }
}

export function createExpression(type: Token, position: ExpressionPosition, ...args): Expression {
    switch (type) {
        case Token.Package: return Expression.createPackage(position, args)
        case Token.Import: return Expression.createImport(position, args);
        case Token.Record: return Expression.createRecord(position, args);
        case Token.Property: return Expression.createProperty(position, args);
        case Token.PrimitiveType: return Expression.createType(position, args);
        case Token.UserType: return Expression.createUserType(position, args);
        case Token.OptionalType: return Expression.createOptionalType(position, args);
        case Token.ImportType: return Expression.createImportType(position, args);
        case Token.RepeatedType: return Expression.createRepeatedType(position, args);
        case Token.MapType: return Expression.createMapType(position, args);
        case Token.Annotation: return Expression.createAnnotation(position, args);
        // Enums
        case Token.NumericEnum: return Expression.createNumericEnum(position, args);
        case Token.NumericEnumMember: return Expression.createNumericEnumMember(position, args);
        case Token.StringEnum: return Expression.createStringEnum(position, args);
        case Token.StringEnumMember: return Expression.createStringEnumMember(position, args);
        // Service
        case Token.Service: return Expression.createService(position, args);
        case Token.Method: return Expression.createMethod(position, args);
        case Token.AnonymousRecord: return Expression.createAnonymousRecord(position, args);
    }
}
