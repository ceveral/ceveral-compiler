import { PackageExpression } from './expressions';
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
    parse(item: PackageExpression, optionsOrPath: PreprocessOptions): Promise<PackageExpression>;
    private process(item, options);
    private detectCircularDependencies(path);
    private import(item, options);
    private getInner(exp);
    private validate(item, options?);
    private detectAmbiguities(item);
    private _detectAbiguities(item, memo);
    private validateModel(record, imports, options?, scope);
    private validateAnnotations(item, options);
    private _getScope(item, memo);
    private getScope(item);
    private validateImport(item, imports, scope);
    private _validateImport(item, type, imports);
    private getModels(item);
    private getImports(item);
}
