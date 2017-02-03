import { PackageExpression, ImportedPackageExpression } from './expressions';
import { Validator } from './options/validator';
export interface PreprocessOptions {
    /**
     * Annotation validators for records
     */
    records?: {
        [key: string]: Validator;
    };
    /**
     * Annotation validators for properties
     */
    properties?: {
        [key: string]: Validator;
    };
    /**
     * Current file path
     */
    fileName: string;
}
export declare class Preprocesser {
    private parent;
    private previousParent;
    parse(item: PackageExpression, options: PreprocessOptions): Promise<ImportedPackageExpression>;
    private process(item, options);
    private detectCircularDependencies(path);
    private import(item, options);
    private getInner(exp);
    private validate(item, options?);
    private validateModel(record, imports, options?);
    private validateAnnotations(item, options);
    private validateImport(item, imports);
    private getModels(item);
    private getImports(item);
}
