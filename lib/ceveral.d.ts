import { Repository } from './repository';
import { Transpiler, IResult } from './transpiler';
export interface TransformOptions {
    transformers: string[];
    fileName: string;
}
export interface AstOptions extends TransformOptions {
}
export declare class Ceveral {
    repository: Repository;
    transpiler: Transpiler;
    private _once;
    constructor();
    transform(input: string, options: TransformOptions): Promise<IResult[]>;
    private _initialize();
    private _getTransformers(q);
}
