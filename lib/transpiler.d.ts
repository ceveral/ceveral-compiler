/// <reference types="node" />
import { Preprocesser, PreprocessOptions } from './preprocesser';
import { ImportedPackageExpression } from './expressions';
export interface Result {
    filename: string;
    buffer: Buffer;
}
export interface CodeGenerator {
    run(ast: ImportedPackageExpression): Promise<Result[]>;
}
export declare class Transpilers {
    pre: Preprocesser;
    ast(input: string, optionsOrFileName?: PreprocessOptions | string): Promise<ImportedPackageExpression>;
    transpile(input: string | ImportedPackageExpression, transformer: CodeGenerator): Promise<Result[]>;
}
