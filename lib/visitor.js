"use strict";
const tokens_1 = require("./tokens");
class BaseVisitor {
    visit(expression) {
        switch (expression.nodeType) {
            case tokens_1.Token.Package: return this.visitPackage(expression);
            case tokens_1.Token.Record: return this.visitRecord(expression);
            case tokens_1.Token.Property: return this.visitProperty(expression);
            case tokens_1.Token.RecordType: return this.visitUserType(expression);
            case tokens_1.Token.PrimitiveType: return this.visitType(expression);
            case tokens_1.Token.ImportType: return this.visitImportType(expression);
            case tokens_1.Token.OptionalType: return this.visitOptionalType(expression);
            case tokens_1.Token.RepeatedType: return this.visitRepeatedType(expression);
            case tokens_1.Token.MapType: return this.visitMapType(expression);
            case tokens_1.Token.EnumType: return this.visitEnumType(expression);
            case tokens_1.Token.EnumMember: return this.visitEnumTypeMember(expression);
            case tokens_1.Token.Annotation: return this.visitAnnotation(expression);
            case tokens_1.Token.Service: return this.visitService(expression);
            case tokens_1.Token.Method: return this.visitMethod(expression);
            case tokens_1.Token.AnonymousRecord: return this.visitAnonymousRecord(expression);
        }
    }
    visitUserType(expression) {
        return expression.name;
    }
    visitService(_) {
    }
    visitMethod(_) {
    }
    visitAnonymousRecord(_) {
    }
}
exports.BaseVisitor = BaseVisitor;
