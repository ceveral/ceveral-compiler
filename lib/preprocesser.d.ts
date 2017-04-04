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
    parse(item: PackageExpression, optionsOrPath: PreprocessOptions): Promise<PackageExpression>;
    private _parse(item, options, ctx);
    private process(item, options, ctx);
    private detectCircularDependencies(path, ctx);
    private import(item, options, ctx);
    private getInner(exp);
    private validate(item, options?);
    private validateModel(record, imports, options, scope);
    private validateAnnotations(item, options);
    private _getScope(item, memo);
    private getScope(item);
    private validateType(item, imports, scope);
    private _validateImport(item, type, imports);
    private getModels(item);
    private getImports(item);
}
