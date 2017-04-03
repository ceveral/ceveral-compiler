"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokens_1 = require("./tokens");
class Expression {
    toJSON(full = false, human = false) {
        if (full === true)
            return this;
        return Object.keys(this)
            .filter((key) => ['position'].indexOf(key) < 0)
            .reduce((newObj, key) => {
            var val = this[key];
            if (key === "nodeType" && human) {
                val = tokens_1.Token[val];
            }
            if (val instanceof Expression) {
                val = val.toJSON(full, human);
                //return Object.assign(newObj, {[key]: this[key].toJSON(full, human)});
            }
            else if (Array.isArray(val)) {
                val = val.map(m => {
                    if (m instanceof Expression)
                        return m.toJSON(full, human);
                    return m;
                });
            }
            return Object.assign(newObj, { [key]: val });
        }, {});
    }
    static createPackage(position, args) {
        return new PackageExpression(position, args[0], args[1]);
    }
    static createImport(position, args) {
        return new ImportExpression(position, args[0], args[1]);
    }
    static createRecord(position, args) {
        return new RecordExpression(position, args[0], args[1], args[2]);
    }
    static createProperty(position, args) {
        return new PropertyExpression(position, args[0], args[1], args[2]);
    }
    static createType(position, args) {
        return new TypeExpression(position, args[0]);
    }
    static createRecordType(position, args) {
        return new RecordTypeExpression(position, args[0]);
    }
    static createOptionalType(position, args) {
        return new OptionalTypeExpression(position, args[0]);
    }
    static createImportType(position, args) {
        return new ImportTypeExpression(position, args[0], args[1]);
    }
    static createRepeatedType(position, args) {
        return new RepeatedTypeExpression(position, args[0]);
    }
    static createMapType(position, args) {
        return new MapTypeExpression(position, args[0], args[1]);
    }
    static createAnnotation(position, args) {
        return new AnnotationExpression(position, args[0], args[1]);
    }
    static createService(position, args) {
        return new ServiceExpression(position, args[0], args[1], args[2]);
    }
    static createMethod(position, args) {
        return new MethodExpression(position, args[0], args[1], args[2], args[3]);
    }
    static createAnonymousRecord(position, args) {
        return new AnonymousRecordExpression(position, args[0]);
    }
    static createNumericEnum(position, args) {
        return new NumericEnumExpression(position, args[0], args[1], args[2]);
    }
    static createNumericEnumMember(position, args) {
        return new NumericEnumMemberExpression(position, args[0], args[1]);
    }
    static createStringEnum(position, args) {
        return new StringEnumExpression(position, args[0], args[1], args[2]);
    }
    static createStringEnumMember(position, args) {
        return new StringEnumMemberExpression(position, args[0], args[1]);
    }
}
exports.Expression = Expression;
class PackageExpression extends Expression {
    constructor(position, name, children) {
        super();
        this.position = position;
        this.name = name;
        this.children = children;
        this.nodeType = tokens_1.Token.Package;
    }
}
exports.PackageExpression = PackageExpression;
class ImportedPackageExpression extends PackageExpression {
}
exports.ImportedPackageExpression = ImportedPackageExpression;
class ImportExpression extends Expression {
    constructor(position, path, as) {
        super();
        this.position = position;
        this.path = path;
        this.as = as;
        this.nodeType = tokens_1.Token.Import;
    }
}
exports.ImportExpression = ImportExpression;
class AnnotatedExpression extends Expression {
    constructor(annotations) {
        super();
        this.annotations = annotations;
    }
    get(name) {
        let found = this.annotations.find(m => m.name === name);
        return found ? found.args : null;
    }
}
exports.AnnotatedExpression = AnnotatedExpression;
class RecordExpression extends AnnotatedExpression {
    constructor(position, name, annotations, properties) {
        super(annotations);
        this.position = position;
        this.name = name;
        this.properties = properties;
        this.nodeType = tokens_1.Token.Record;
    }
}
exports.RecordExpression = RecordExpression;
class PropertyExpression extends AnnotatedExpression {
    constructor(position, name, annotations, type) {
        super(annotations);
        this.position = position;
        this.name = name;
        this.type = type;
        this.nodeType = tokens_1.Token.Property;
    }
}
exports.PropertyExpression = PropertyExpression;
class TypeExpression extends Expression {
    constructor(position, type) {
        super();
        this.position = position;
        this.type = type;
        this.nodeType = tokens_1.Token.PrimitiveType;
    }
    toJSON(full = false, human = false) {
        let json = super.toJSON(full, human);
        if (human)
            json.type = tokens_1.Type[json.type];
        return json;
    }
}
exports.TypeExpression = TypeExpression;
class RecordTypeExpression extends Expression {
    constructor(position, name) {
        super();
        this.position = position;
        this.name = name;
        this.nodeType = tokens_1.Token.UserType;
    }
}
exports.RecordTypeExpression = RecordTypeExpression;
class OptionalTypeExpression extends Expression {
    constructor(position, type) {
        super();
        this.position = position;
        this.type = type;
        this.nodeType = tokens_1.Token.OptionalType;
    }
}
exports.OptionalTypeExpression = OptionalTypeExpression;
class ImportTypeExpression extends Expression {
    constructor(position, packageName, name) {
        super();
        this.position = position;
        this.packageName = packageName;
        this.name = name;
        this.nodeType = tokens_1.Token.ImportType;
    }
}
exports.ImportTypeExpression = ImportTypeExpression;
class RepeatedTypeExpression extends Expression {
    constructor(position, type) {
        super();
        this.position = position;
        this.type = type;
        this.nodeType = tokens_1.Token.RepeatedType;
    }
}
exports.RepeatedTypeExpression = RepeatedTypeExpression;
class MapTypeExpression extends Expression {
    constructor(position, key, value) {
        super();
        this.position = position;
        this.key = key;
        this.value = value;
        this.nodeType = tokens_1.Token.MapType;
    }
}
exports.MapTypeExpression = MapTypeExpression;
class AnnotationExpression extends Expression {
    constructor(position, name, args) {
        super();
        this.position = position;
        this.name = name;
        this.args = args;
        this.nodeType = tokens_1.Token.Annotation;
    }
}
exports.AnnotationExpression = AnnotationExpression;
class MethodExpression extends AnnotatedExpression {
    constructor(position, name, annotations, parameter, returns) {
        super(annotations);
        this.position = position;
        this.name = name;
        this.parameter = parameter;
        this.returns = returns;
        this.nodeType = tokens_1.Token.Method;
    }
}
exports.MethodExpression = MethodExpression;
class ServiceExpression extends AnnotatedExpression {
    constructor(position, name, annotations, methods) {
        super(annotations);
        this.position = position;
        this.name = name;
        this.annotations = annotations;
        this.methods = methods;
        this.nodeType = tokens_1.Token.Service;
    }
}
exports.ServiceExpression = ServiceExpression;
class AnonymousRecordExpression extends Expression {
    constructor(position, properties) {
        super();
        this.position = position;
        this.properties = properties;
        this.nodeType = tokens_1.Token.AnonymousRecord;
    }
}
exports.AnonymousRecordExpression = AnonymousRecordExpression;
class NumericEnumExpression extends AnnotatedExpression {
    constructor(position, name, annotations, members) {
        super(annotations);
        this.position = position;
        this.name = name;
        this.annotations = annotations;
        this.members = members;
        this.nodeType = tokens_1.Token.NumericEnum;
    }
}
exports.NumericEnumExpression = NumericEnumExpression;
class NumericEnumMemberExpression extends Expression {
    constructor(position, name, value) {
        super();
        this.position = position;
        this.name = name;
        this.value = value;
        this.nodeType = tokens_1.Token.NumericEnumMember;
    }
}
exports.NumericEnumMemberExpression = NumericEnumMemberExpression;
class StringEnumExpression extends AnnotatedExpression {
    constructor(position, name, annotations, members) {
        super(annotations);
        this.position = position;
        this.name = name;
        this.annotations = annotations;
        this.members = members;
        this.nodeType = tokens_1.Token.StringEnum;
    }
}
exports.StringEnumExpression = StringEnumExpression;
class StringEnumMemberExpression extends Expression {
    constructor(position, name, value) {
        super();
        this.position = position;
        this.name = name;
        this.value = value;
        this.nodeType = tokens_1.Token.StringEnumMember;
    }
}
exports.StringEnumMemberExpression = StringEnumMemberExpression;
function createExpression(type, position, ...args) {
    switch (type) {
        case tokens_1.Token.Package: return Expression.createPackage(position, args);
        case tokens_1.Token.Import: return Expression.createImport(position, args);
        case tokens_1.Token.Record: return Expression.createRecord(position, args);
        case tokens_1.Token.Property: return Expression.createProperty(position, args);
        case tokens_1.Token.PrimitiveType: return Expression.createType(position, args);
        case tokens_1.Token.UserType: return Expression.createRecordType(position, args);
        case tokens_1.Token.OptionalType: return Expression.createOptionalType(position, args);
        case tokens_1.Token.ImportType: return Expression.createImportType(position, args);
        case tokens_1.Token.RepeatedType: return Expression.createRepeatedType(position, args);
        case tokens_1.Token.MapType: return Expression.createMapType(position, args);
        case tokens_1.Token.Annotation: return Expression.createAnnotation(position, args);
        case tokens_1.Token.NumericEnum: return Expression.createNumericEnum(position, args);
        case tokens_1.Token.NumericEnumMember: return Expression.createNumericEnumMember(position, args);
        case tokens_1.Token.StringEnum: return Expression.createStringEnum(position, args);
        case tokens_1.Token.StringEnumMember: return Expression.createStringEnumMember(position, args);
        case tokens_1.Token.Service: return Expression.createService(position, args);
        case tokens_1.Token.Method: return Expression.createMethod(position, args);
        case tokens_1.Token.AnonymousRecord: return Expression.createAnonymousRecord(position, args);
    }
}
exports.createExpression = createExpression;
