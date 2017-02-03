
import { Preprocesser, PreprocessOptions } from './preprocesser'
import { ImportedPackageExpression } from './expressions'
import * as Parser from './parser';
import {isString} from './utils';

export interface Result {
    filename: string;
    buffer: Buffer;
}

export interface CodeGenerator {
    run(ast:ImportedPackageExpression): Promise<Result[]>
}

export class Transpiler {
    pre: Preprocesser = new Preprocesser();

    ast(input: string, optionsOrFileName?: PreprocessOptions|string) {
        return new Promise<ImportedPackageExpression>((resolve, reject) => {
            let output = Parser.parse(input);

            let o:PreprocessOptions;
            if (isString(optionsOrFileName)) {
                o = {fileName:optionsOrFileName};
            } else {
                o = optionsOrFileName;
            }
            
            this.pre.parse(output, o).then(resolve, reject);
        });
    }

    async transpile(input:string|ImportedPackageExpression, transformer:CodeGenerator) {

        let ast = isString(input) ? (await this.ast(input)) : input;
        let result = await transformer.run(ast);

        return result;
    }
}