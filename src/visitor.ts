import {Token} from './tokens';
import {
    Expression, PackageExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, OptionalTypeExpression,
    MapTypeExpression, RecordTypeExpression,
    ServiceExpression, MethodExpression, AnonymousRecordExpression, EnumTypeExpression, EnumMemberExpression
} from './expressions';

export interface IVisitor {
    visit(expression: Expression): any;
    visitPackage(expression: PackageExpression): any;
    // Records 
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitType(expression: TypeExpression): any;
    visitUserType(expression: RecordTypeExpression): any
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
    
    visitEnumType(expression: EnumTypeExpression): any;
    visitEnumTypeMember(expression: EnumMemberExpression): any;
    
    visitAnnotation(expression: AnnotationExpression): any

    // Services
    visitService(expression: ServiceExpression): any;
    visitMethod(expression: MethodExpression): any;
    visitAnonymousRecord(expression: AnonymousRecordExpression): any;
}


export abstract class BaseVisitor implements IVisitor {

    visit(expression: Expression): any {

        switch (expression.nodeType) {
            case Token.Package: return this.visitPackage(expression as PackageExpression);
            case Token.Record: return this.visitRecord(expression as RecordExpression);
            case Token.Property: return this.visitProperty(expression as PropertyExpression);
            case Token.RecordType: return this.visitUserType(expression as RecordTypeExpression);
            case Token.PrimitiveType: return this.visitType(expression as TypeExpression);
            case Token.ImportType: return this.visitImportType(expression as ImportTypeExpression);
            case Token.OptionalType: return this.visitOptionalType(expression as OptionalTypeExpression);
            case Token.RepeatedType: return this.visitRepeatedType(expression as RepeatedTypeExpression);
            case Token.MapType: return this.visitMapType(expression as MapTypeExpression);
            case Token.EnumType: return this.visitEnumType(expression as EnumTypeExpression);
            case Token.EnumMember: return this.visitEnumTypeMember(expression as EnumMemberExpression);
            case Token.Annotation: return this.visitAnnotation(expression as AnnotationExpression);

            case Token.Service: return this.visitService(expression as ServiceExpression);
            case Token.Method: return this.visitMethod(expression as MethodExpression);
            case Token.AnonymousRecord: return this.visitAnonymousRecord(expression as AnonymousRecordExpression);
        }

    }

    visitUserType(expression: RecordTypeExpression): any {
        return expression.name;
    }

    //abstract visitImport(expression: ImportExpression): any;
    abstract visitPackage(expression: PackageExpression): any;
    abstract visitRecord(expression: RecordExpression): any;
    abstract visitProperty(expression: PropertyExpression): any;
    abstract visitType(expression: TypeExpression): any;
    abstract visitImportType(expression: ImportTypeExpression): any;
    abstract visitOptionalType(expression: OptionalTypeExpression): any;
    abstract visitRepeatedType(expression: RepeatedTypeExpression): any;
    abstract visitMapType(expression: MapTypeExpression): any;
    abstract visitAnnotation(expression: AnnotationExpression): any
    abstract visitEnumType(expression: EnumTypeExpression): any;
    abstract visitEnumTypeMember(expression: EnumMemberExpression): any;

    visitService(_: ServiceExpression): any {

    }

    visitMethod(_: MethodExpression): any {

    }

    visitAnonymousRecord(_: AnonymousRecordExpression): any {

    }

}
