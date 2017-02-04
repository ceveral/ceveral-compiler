import { Repository, getAnnotationValidations, TransformerDescription } from './repository';
import { Transpiler, IResult } from './transpiler'

export interface TransformOptions {
    transformers: string[]
    fileName: string;
}

export interface AstOptions extends TransformOptions {
}

export class Ceveral {
    repository = new Repository();
    transpiler = new Transpiler();
    private _initialized: boolean = false;
    constructor() {

    }

    async transform(input: string, options: TransformOptions) {
        
        if (!this._initialized) throw new Error('ceveral is not setup yet.');
        if (!options.transformers) throw new Error('for transformers');

        let transformers = this._getTransformers(options.transformers);
        
        let files: IResult[] = [];
        for (let transformer of transformers) {
            let opts = getAnnotationValidations(transformer)||{fileName:options.fileName};
            let results = await this.transpiler.transpile(input, transformer, opts);
            if (results) {
                files.push(...results)
            }
        }
        
        return files;
    }

    setup() {
        if (this._initialized) {
            return;
        }
        return this.repository.loadTransformers()
            .then(() => {
                this._initialized = true;
            });
    }

    private _getTransformers(q: string[]): TransformerDescription[] {
        let notfound: string[] = [];
        let transformers = q.map(t => {
            return this.repository.getTransformer(t);
        }).filter((m, i) => {
            if (m == null) {
                notfound.push(q[i]);
                return false;
            }
            return true;
        });

        if (notfound.length) {
            throw new Error(`Could not find template: ${notfound.join(', ')}`)
        }
        return transformers;
     }
}