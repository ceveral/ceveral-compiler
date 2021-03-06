import { resolver } from './resolver';
import { ImportedPackageExpression } from '../expressions';
import {PreprocessOptions} from '../preprocesser'
import { IResult, CodeGenerator, TranspileOptions } from '../transpiler'
import {Validator} from '../options/validator'
import * as Path from 'path';
import * as Debug from 'debug';
const debug = Debug('ceveral:resolver');

export interface AnnotationDescriptions {
    records?: { [key: string]: AnnotationDescription };
    properties?: { [key: string]: AnnotationDescription };
}

export interface AnnotationDescription {
    arguments: string;
}


export interface TransformerDescription extends CodeGenerator {
    id?:string;
    name: string;
    description?: string;
    annotations: AnnotationDescriptions;
    transform(ast: ImportedPackageExpression, options:TranspileOptions): Promise<IResult[]>
}

export function getAnnotationValidations(desc: TransformerDescription): PreprocessOptions {

    if (!desc.annotations) return null;

    let out: PreprocessOptions = { records: {}, properties: {}, fileName: null }
    for (let key of ['properties', 'records']) {
        let an: AnnotationDescriptions = desc.annotations[key];

        for (let k in an) {
            let a: AnnotationDescription = an[k];
            out[key][k] = Validator.create(a.arguments);
        }
    }

    return out;
}

function isDescription(a: any): a is TransformerDescription {
    if (!a) return false;
    return typeof a.name === 'string' && typeof a.transform === 'function'
}


export class Repository {
    transformers: {[key:string]:TransformerDescription} = {};
    async loadTransformers() {
        let paths = await resolver.lookup("ceveral-transformer")

        for (let path of paths) {
            let desc: TransformerDescription;
            debug('found path %s, trying to load', path);
            try {
                desc = require(path);
                
                if (desc && (<any>desc).__esModule) {
                    desc = (<any>desc).default
                }
            } catch (e) { 
                debug('could not load %s: %s', path, e.message);                
                continue; 
            }
            let base = Path.basename(Path.dirname(path)).replace('ceveral-transformer-','');
            debug('found transformer "%s" at path "%s"', desc.name, path);
            if (isDescription(desc)) this.transformers[base] = desc;
        }

        
    }

    getTransformer(name:string) {
        if (this.transformers[name]) return this.transformers[name];
        for (let key in this.transformers) {
            let v = this.transformers[key];
            if (v.name === name) return v;
        }
        return null;
    }
}
