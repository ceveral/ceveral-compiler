"use strict";
const tokens_1 = require("./tokens");
class BaseVisitor {
    visit(expression) {
        switch (expression.nodeType) {
            case tokens_1.Token.Package: return this.visitPackage(expression);
            case tokens_1.Token.Record: return this.visitRecord(expression);
            case tokens_1.Token.Property: return this.visitProperty(expression);
            case tokens_1.Token.UserType: return this.visitUserType(expression);
            case tokens_1.Token.PrimitiveType: return this.visitType(expression);
            case tokens_1.Token.ImportType: return this.visitImportType(expression);
            case tokens_1.Token.OptionalType: return this.visitOptionalType(expression);
            case tokens_1.Token.RepeatedType: return this.visitRepeatedType(expression);
            case tokens_1.Token.MapType: return this.visitMapType(expression);
            case tokens_1.Token.NumericEnum: return this.visitNumericEnum(expression);
            case tokens_1.Token.NumericEnumMember: return this.visitNumericEnumMember(expression);
            case tokens_1.Token.StringEnum: return this.visitStringEnum(expression);
            case tokens_1.Token.StringEnumMember: return this.visitStringEnumMember(expression);
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
