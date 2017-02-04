import {Token} from './tokens';
import { PackageExpression, RecordExpression,
     PropertyExpression, ImportedPackageExpression, ImportExpression
} from './expressions';
import {Validator} from './options/validator'
import * as Path from 'path';
import * as Parser from './parser';
import * as fs from 'mz/fs';
import {flatten} from './utils';
import {ValidationError,AnnotationValidationError} from './errors'
import * as Debug from 'debug';
const debug = Debug('ceveral:preprocesser');
import * as _ from 'lodash';

export interface PreprocessOptions {
    /**
     * Annotation validators for records
     */
    records?: { [key: string]: Validator };
    /**
     * Annotation validators for properties
     */
    properties?: { [key: string]: Validator };
    /**
     * Current file path
     */
    fileName: string;
}

// Validate Record types
// Validate Services
// Validate Enum
export class Preprocesser {
    private parent: string;
    private previousParent: string

    async parse(item: PackageExpression, optionsOrPath: PreprocessOptions) {
        let options: PreprocessOptions = optionsOrPath||{fileName:null};

        if (typeof optionsOrPath === 'string') {
            options = {fileName: optionsOrPath};
        }

        if (!options.fileName) throw new Error('You must provide a fileName');

        let pack = await this.process(item, options)
        this.validate(pack, options);

        return pack;
    }


    private async process(item: PackageExpression, options: PreprocessOptions): Promise<ImportedPackageExpression> {
        if (!item) return null;


        if (item.nodeType !== Token.Package) {
            throw new Error('Expression not a package');
        }

        let e = item as ImportedPackageExpression;
        e.imports = [];

        let children = [];
        for (let i = 0, len = e.children.length; i < len; i++) {
            let child = e.children[i];
            if (child.nodeType !== Token.Import) {
                children.push(child)
                continue
            }

            e.imports.push(await this.import(child as ImportExpression, options));
        }
        e.children = children;
        e.fileName = options.fileName;
        return e;
    }

    private detectCircularDependencies(path: string) {
        if (this.previousParent == path) {
            let e = `circle dependencies detected: ${Path.basename(path)} and ${Path.basename(this.parent)} depends on eachother`;
            throw new Error(e);
        }
        this.previousParent = this.parent
        this.parent = path;
    }


    private async import(item: ImportExpression, options: PreprocessOptions): Promise<ImportedPackageExpression> {
        let dirName = Path.dirname(options.fileName);
        let path = Path.resolve(dirName, item.path + ".cev");

        this.detectCircularDependencies(path);

        let data = await fs.readFile(path);

        let ast: PackageExpression = Parser.parse(data.toString());
        if (!(ast instanceof PackageExpression)) {
            throw Error('ERROR');
        }

        let o = Object.assign({}, options, {
            fileName: path
        });

        let p: ImportedPackageExpression = await this.parse(ast, o);

        return p;

    }

    private getInner(exp: PropertyExpression) {
        switch (exp.type.nodeType) {
            case Token.ImportType:
            case Token.MapType:
            case Token.RecordType:
            case Token.PrimitiveType: return exp.type;
            default: return this.getInner(exp.type as PropertyExpression);
        }
    }

    private validate(item: PackageExpression, options?: PreprocessOptions) {
        let imports = this.getImports(item);
        let models = this.getModels(item);

        let errors: Error[] = [];
        for (let model of models) {
            errors.push(...this.validateModel(model, imports, options));
        }

        if (errors.length) {
            throw new ValidationError("errors", errors);
        }
    }

    private validateModel(record: RecordExpression, imports: string[][], options?: PreprocessOptions) {
        let errors: Error[] = [];
        if (options) {
            let e = this.validateAnnotations(record, options);
            if (e.length) errors.push(...e);
        }

        for (let prop of record.properties) {
            if (options) {
                errors.push(...this.validateAnnotations(prop, options))
            }

            errors.push(...this.validateImport(prop, imports));
        }

        return errors;

    }

    private validateAnnotations(item: RecordExpression | PropertyExpression, options: PreprocessOptions) {

        let annotations = item.annotations;
        let isRecord = item.nodeType === Token.Record;

        let checkers = (isRecord ? options.records : options.properties) || {};
        let errors: Error[] = [];
        for (let a of annotations) {
            if (!checkers[a.name]) {
                continue;
            }

            if (!checkers[a.name].validate(a.args)) {
                errors.push(new AnnotationValidationError(`Invalid annotation argument for ${a.name} on ${item.name}`, a.position, checkers[a.name].input, typeof a.args));
            }
        }


        return errors;
    }

    private validateImport(item: PropertyExpression, imports: string[][]) {

        let type = this.getInner(item)
        if (type.nodeType !== Token.ImportType) return [];

        let found = !!imports.find(m => m[0] == type.packageName && m[1] == type.name);
    
        if (!found) {
            return [new ValidationError(`imported usertype: "${type.packageName}.${type.name}", could not be resolved`, {
                property: item.name,
                type: type.name,
                position: type.position
            })];
        }
        return [];
    }



    private getModels(item: PackageExpression) {
        return item.children.filter(m => m.nodeType == Token.Record) as RecordExpression[];
    }

    private getImports(item: PackageExpression) {
        let include = [Token.Record, Token.StringEnum, Token.NumericEnum]
        let imports = item.imports.map(m => {
            return m.children.filter(mm => include.indexOf(mm.nodeType) > -1).map(mm => [m.name, (mm as RecordExpression).name]);
        });
        
        return _.flatten(imports)

    }

}
