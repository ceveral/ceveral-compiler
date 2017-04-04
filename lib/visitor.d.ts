import { Expression, PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, OptionalTypeExpression, MapTypeExpression, UserTypeExpression, ServiceExpression, MethodExpression, AnonymousRecordExpression, NumericEnumExpression, NumericEnumMemberExpression, StringEnumExpression, StringEnumMemberExpression } from './expressions';
export interface IVisitor {
    visit(expression: Expression): any;
    visitPackage(expression: PackageExpression): any;
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitNumericEnum(expression: NumericEnumExpression): any;
    visitNumericEnumMember(expression: NumericEnumMemberExpression): any;
    visitStringEnum(expression: StringEnumExpression): any;
    visitStringEnumMember(expression: StringEnumMemberExpression): any;
    visitType(expression: TypeExpression): any;
    visitUserType(expression: UserTypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any;
    visitService(expression: ServiceExpression): any;
    visitMethod(expression: MethodExpression): any;
    visitAnonymousRecord(expression: AnonymousRecordExpression): any;
}
export declare abstract class BaseVisitor implements IVisitor {
    visit(expression: Expression): any;
    visitUserType(expression: UserTypeExpression): any;
    abstract visitPackage(expression: PackageExpression): any;
    abstract visitRecord(expression: RecordExpression): any;
    abstract visitProperty(expression: PropertyExpression): any;
    abstract visitType(expression: TypeExpression): any;
    abstract visitImportType(expression: ImportTypeExpression): any;
    abstract visitOptionalType(expression: OptionalTypeExpression): any;
    abstract visitRepeatedType(expression: RepeatedTypeExpression): any;
    abstract visitMapType(expression: MapTypeExpression): any;
    abstract visitAnnotation(expression: AnnotationExpression): any;
    abstract visitNumericEnum(expression: NumericEnumExpression): any;
    abstract visitNumericEnumMember(expression: NumericEnumMemberExpression): any;
    abstract visitStringEnum(expression: StringEnumExpression): any;
    abstract visitStringEnumMember(expression: StringEnumMemberExpression): any;
    visitService(_: ServiceExpression): any;
    visitMethod(_: MethodExpression): any;
    visitAnonymousRecord(_: AnonymousRecordExpression): any;
}
