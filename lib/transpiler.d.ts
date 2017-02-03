/// <reference types="node" />
import { Preprocesser, PreprocessOptions } from './preprocesser';
import { ImportedPackageExpression } from './expressions';
export interface Result {
    filename: string;
    buffer: Buffer;
}
export interface CodeGenerator {
    transform(ast: ImportedPackageExpression, options: TranspileOptions): Promise<Result[]>;
}
export interface TranspileOptions extends PreprocessOptions {
    split?: boolean;
}
export declare class Transpiler {
    pre: Preprocesser;
    ast(input: string, optionsOrFileName?: PreprocessOptions | string): Promise<ImportedPackageExpression>;
    transpile(input: string | ImportedPackageExpression, transformer: CodeGenerator, options?: TranspileOptions): Promise<Result[]>;
}
