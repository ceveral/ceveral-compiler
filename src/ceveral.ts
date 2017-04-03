import { Repository, getAnnotationValidations, TransformerDescription } from './repository';
import { Transpiler, IResult } from './transpiler'
import { Once } from './utils';

export interface TransformOptions {
    transformers: string[]
    fileName: string;
}

export interface AstOptions extends TransformOptions {
}




export class Ceveral {
    repository = new Repository();
    transpiler = new Transpiler();

    private _once: Once<void>;

    constructor() {
        this._once = new Once<void>(this._initialize.bind(this));
    }

    async transform(input: string, options: TransformOptions) {

        await this._once.call();

        //if (!this._initialized) throw new Error('ceveral is not setup yet.');
        if (!options.transformers) throw new Error('for transformers');

        let transformers = this._getTransformers(options.transformers);

        let files: IResult[] = [];
        for (let transformer of transformers) {
            let opts = getAnnotationValidations(transformer) || { fileName: options.fileName };
            opts.fileName = opts.fileName || options.fileName;
            let results = await this.transpiler.transpile(input, transformer, opts);
            if (results) {
                files.push(...results)
            }
        }

        return files;
    }

    private _initialize() {
        return this.repository.loadTransformers()
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
            throw new Error(`could not find ${notfound.length > 1 ? 'templates' : 'template'}: ${notfound.join(', ')}`)
        }
        return transformers;
    }
}