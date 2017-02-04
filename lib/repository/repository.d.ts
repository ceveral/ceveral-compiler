import { ImportedPackageExpression } from '../expressions';
import { PreprocessOptions } from '../preprocesser';
import { IResult, CodeGenerator, TranspileOptions } from '../transpiler';
export interface AnnotationDescriptions {
    records?: {
        [key: string]: AnnotationDescription;
    };
    properties?: {
        [key: string]: AnnotationDescription;
    };
}
export interface AnnotationDescription {
    arguments: string;
}
export interface TransformerDescription extends CodeGenerator {
    id?: string;
    name: string;
    description?: string;
    annotations: AnnotationDescriptions;
    transform(ast: ImportedPackageExpression, options: TranspileOptions): Promise<IResult[]>;
}
export declare function getAnnotationValidations(desc: TransformerDescription): PreprocessOptions;
export declare class Repository {
    transformers: {
        [key: string]: TransformerDescription;
    };
    loadTransformers(): Promise<void>;
    getTransformer(name: string): TransformerDescription;
}
