/// <reference types="node" />
import { Preprocesser, PreprocessOptions } from './preprocesser';
import { PackageExpression } from './expressions';
export interface IResult {
    filename: string;
    buffer: Buffer;
}
export interface CodeGenerator {
    transform(ast: PackageExpression, options: TranspileOptions): Promise<IResult[]>;
}
export interface TranspileOptions extends PreprocessOptions {
    split?: boolean;
}
export declare class Transpiler {
    pre: Preprocesser;
    ast(input: string, optionsOrFileName?: PreprocessOptions | string): Promise<PackageExpression>;
    transpile(input: string | PackageExpression, transformer: CodeGenerator, options?: TranspileOptions): Promise<IResult[]>;
}
