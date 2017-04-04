import { Token } from './tokens';
import {
    Expression, StringEnumExpression, NumericEnumExpression,
    PackageExpression, RecordExpression, UserTypeExpression,
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

type Scope = {[key:string]: string};
interface Context {
    parent: string;
    previousParent: string;
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
    
    async parse(item: PackageExpression, optionsOrPath: PreprocessOptions) {
        let options: PreprocessOptions = optionsOrPath || { fileName: null };

        if (typeof optionsOrPath === 'string') {
            options = { fileName: optionsOrPath };
        }

        if (!options.fileName) throw new Error('You must provide a fileName');
        let ctx = {parent:null,previousParent:null};
        let pack = await this.process(item, options, ctx)
        this.validate(pack, options);

        return pack;
    }

    private async _parse(item: PackageExpression, options:PreprocessOptions, ctx: Context) {
        let pack = await this.process(item, options, ctx)
        this.validate(pack, options);
        return pack
    }


    private async process(item: PackageExpression, options: PreprocessOptions, ctx: Context): Promise<PackageExpression> {
        if (!item) return null;


        if (item.nodeType !== Token.Package) {
            throw new Error('Expression not a package');
        }

        let children = [];
        let imports = [];
        for (let i = 0, len = item.children.length; i < len; i++) {
            let child = item.children[i];
            if (child.nodeType !== Token.Import) {
                children.push(child)
                continue
            }

            imports.push(this.import(child as ImportExpression, options, ctx));
        }

        item.imports = await Promise.all(imports);
        item.children = children;
        item.fileName = options.fileName;
        return item;
    }

    private detectCircularDependencies(path: string, ctx: Context) {
        if (ctx.previousParent == path) {
            let e = `circle dependencies detected: ${Path.basename(path)} and ${Path.basename(ctx.parent)} depends on eachother`;
            throw new Error(e);
        }
        ctx.previousParent = ctx.parent
        ctx.parent = path;
    }


    private async import(item: ImportExpression, options: PreprocessOptions, ctx: Context): Promise<ImportedPackageExpression> {
        let dirName = Path.dirname(options.fileName);
        let path = Path.resolve(dirName, normalizePath(item.path));

        this.detectCircularDependencies(path, ctx);

        let data = await fs.readFile(path);

        let ast: PackageExpression = Parser.parse(data.toString());
        if (!(ast instanceof PackageExpression)) {
            throw Error('fatal: this sould never happen');
        }

        let o = Object.assign({}, options, {
            fileName: path
        });

        let p: PackageExpression = await this._parse(ast, o, ctx);

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

        let scope: Scope,
            errors: Error[] = [];

        try {
            scope  = this.getScope(item);
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

    private validateModel(record: RecordExpression, imports: string[][], options: PreprocessOptions = null, scope: Scope) {
        let errors: Error[] = [];
        if (options) {
            let e = this.validateAnnotations(record, options);
            if (e.length) errors.push(...e);
        }

        for (let prop of record.properties) {
            if (options) {
                errors.push(...this.validateAnnotations(prop, options))
            }

            errors.push(...this.validateType(prop, imports, scope));
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

    private _getScope(item: PackageExpression, memo: Scope) {
    
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
        let memo:Scope = {};
        this._getScope(item, memo);
        for (let i of item.imports) {
            this._getScope(i, memo);
        }
        return memo


    }

    // Validate a property type
    private validateType(item: PropertyExpression, imports: string[][], scope: Scope) {

        let type = this.getInner(item)
        switch (type.nodeType) {
            case Token.ImportType:
                return this._validateImport(item, type as ImportTypeExpression, imports);
            case Token.PrimitiveType:
                return [];
        }

        if (type.nodeType != Token.UserType) return [];

        let name = (type as UserTypeExpression).name;
        if (!scope[name]) return [new ValidationError(`could not resolve type: ${name}`, <any>{
            property: item.name,
            type: name,
            position: (<any>type).position
        })];

        return [];
    }

    // Validate an imported type 
    // TODO: refactor to use scope
    private _validateImport(item: PropertyExpression, type: ImportTypeExpression, imports: string[][]) {
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
            return m.children.filter(mm => include.indexOf(mm.nodeType) > -1).map(mm => [m.as || m.name, (mm as RecordExpression).name]);
        });

        return _.flatten(imports)

    }

}
