import { Token } from './tokens';
import {
    Expression, StringEnumExpression, NumericEnumExpression,
    PackageExpression, RecordExpression, RecordTypeExpression,
    PropertyExpression, ImportedPackageExpression, ImportExpression, ImportTypeExpression
} from './expressions';
import { Validator } from './options/validator'
import * as Path from 'path';
import * as Parser from './parser';
import * as fs from 'mz/fs';
import { ValidationError, AnnotationValidationError } from './errors'
import * as _ from 'lodash';

function normalizePath(path: string) {
    return path + (Path.extname(path) == "" ? ".cev" : '');
}

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
        let options: PreprocessOptions = optionsOrPath || { fileName: null };

        if (typeof optionsOrPath === 'string') {
            options = { fileName: optionsOrPath };
        }

        if (!options.fileName) throw new Error('You must provide a fileName');

        let pack = await this.process(item, options)
        this.validate(pack, options);

        return pack;
    }


    private async process(item: PackageExpression, options: PreprocessOptions): Promise<PackageExpression> {
        if (!item) return null;


        if (item.nodeType !== Token.Package) {
            throw new Error('Expression not a package');
        }

        /*let e = item as PackageExpression;
        e.imports = [];*/
        item.imports = [];

        let children = [];
        for (let i = 0, len = item.children.length; i < len; i++) {
            let child = item.children[i];
            if (child.nodeType !== Token.Import) {
                children.push(child)
                continue
            }

            item.imports.push(await this.import(child as ImportExpression, options));
        }
        item.children = children;
        item.fileName = options.fileName;
        return item;
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
        let path = Path.resolve(dirName, normalizePath(item.path));

        this.detectCircularDependencies(path);

        let data = await fs.readFile(path);

        let ast: PackageExpression = Parser.parse(data.toString());
        if (!(ast instanceof PackageExpression)) {
            throw Error('fatal: this sould never happen');
        }

        let o = Object.assign({}, options, {
            fileName: path
        });

        let p: PackageExpression = await this.parse(ast, o);

        let i = new ImportedPackageExpression(p);
        i.as = item.as;

        return i;

    }

    private getInner(exp: PropertyExpression): Expression {
        switch (exp.type.nodeType) {
            case Token.ImportType:
            case Token.MapType:
            case Token.UserType:
            case Token.PrimitiveType: return exp.type;
            default: return this.getInner(exp.type as PropertyExpression);
        }
    }

    private validate(item: PackageExpression, options?: PreprocessOptions) {
        let imports = this.getImports(item);
        let models = this.getModels(item);

        let scope = this.getScope(item);

        let errors: Error[] = [];

        try {
            this.detectAmbiguities(item);
        } catch (e) {
            errors.push(e);
        }

        for (let model of models) {
            errors.push(...this.validateModel(model, imports, options, scope));
        }

        if (errors.length) {
            throw new ValidationError("ValidationError", errors);
        }
    }

    private detectAmbiguities(item: PackageExpression) {
        let memo: { [key: string]: boolean } = {};
        
        this._detectAbiguities(item, memo);

        for (let i of item.imports) {
            this._detectAbiguities(i, memo);
        }
        
    }

    private _detectAbiguities(item: PackageExpression, memo: { [key: string]: boolean }) {
        let ass = (item instanceof ImportedPackageExpression) ? item.as||item.name : item.name;
        for (let child of item.children) {
            let name = function (child: Expression) {
                switch (child.nodeType) {
                    case Token.Record: return (child as RecordExpression).name;
                    case Token.StringEnum: return (child as StringEnumExpression).name;
                    case Token.NumericEnum: return (child as NumericEnumExpression).name;
                    default: return null;
                }
            }(child);

            if (name === null) continue;

            name = ass ? `${ass}.${name}` : name

            if (memo[name]) throw new Error(`type ${name} already defined in scope`);
            memo[name] = true;
        }
    }
    private validateModel(record: RecordExpression, imports: string[][], options?: PreprocessOptions, scope:{[key:string]:string}) {
        let errors: Error[] = [];
        if (options) {
            let e = this.validateAnnotations(record, options);
            if (e.length) errors.push(...e);
        }

        for (let prop of record.properties) {
            if (options) {
                errors.push(...this.validateAnnotations(prop, options))
            }

            errors.push(...this.validateImport(prop, imports, scope));
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

    private _getScope(item:PackageExpression, memo: {[key:string]: string}) {

        let ass = (item instanceof ImportedPackageExpression) ? item.as : undefined;
        for (let child of item.children) {
            let name = function (child: Expression) {
                switch (child.nodeType) {
                    case Token.Record: return (child as RecordExpression).name;
                    case Token.StringEnum: return (child as StringEnumExpression).name;
                    case Token.NumericEnum: return (child as NumericEnumExpression).name;
                    default: return null;
                }
            }(child);

            if (name === null) continue;

            name = ass ? `${ass}.${name}` : name

            if (memo[name]) throw new ValidationError(`type ${name} already defined in scope`);
            memo[name] = item.fileName;
        }
    }

    private getScope(item: PackageExpression) {
        let memo:{[key:string]: string} = {};

        this._getScope(item, memo);

        for (let i of item.imports) {
            this._getScope(i, memo);
        }

        return memo

        
    }

    private validateImport(item: PropertyExpression, imports: string[][], scope:{[key:string]: string}) {

        let type = this.getInner(item)
        switch (type.nodeType) {
            case Token.ImportType:
                return this._validateImport(item, type as ImportTypeExpression, imports);
            case Token.PrimitiveType:
                return [];
        }

        if (type.nodeType != Token.UserType) return [];
        
        let name = (type as RecordTypeExpression).name;
        if (!scope[name]) return [new ValidationError(`could not resolve type: ${name}`,<any>{
                property: item.name,
                type: name,
                position: (<any>type).position
            })];
        
        return [];
    }

    private _validateImport(item:PropertyExpression, type: ImportTypeExpression , imports: string[][]) {
        let found = !!imports.find(m => m[0] == type.packageName && m[1] == type.name);

        if (!found) {
            return [new ValidationError(`imported usertype: "${type.packageName}.${type.name}", could not be resolved`, <any>{
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
            return m.children.filter(mm => include.indexOf(mm.nodeType) > -1).map(mm => [m.as||m.name, (mm as RecordExpression).name]);
        });

        return _.flatten(imports)

    }

}
