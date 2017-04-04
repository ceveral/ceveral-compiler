"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const tokens_1 = require("./tokens");
const expressions_1 = require("./expressions");
const Path = require("path");
const Parser = require("./parser");
const fs = require("mz/fs");
const errors_1 = require("./errors");
const _ = require("lodash");
function normalizePath(path) {
    return path + (Path.extname(path) == "" ? ".cev" : '');
}
// Validate Record types
// Validate Services
// Validate Enum
class Preprocesser {
    parse(item, optionsOrPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = optionsOrPath || { fileName: null };
            if (typeof optionsOrPath === 'string') {
                options = { fileName: optionsOrPath };
            }
            if (!options.fileName)
                throw new Error('You must provide a fileName');
            let ctx = { parent: null, previousParent: null };
            let pack = yield this.process(item, options, ctx);
            this.validate(pack, options);
            return pack;
        });
    }
    _parse(item, options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let pack = yield this.process(item, options, ctx);
            this.validate(pack, options);
            return pack;
        });
    }
    process(item, options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item)
                return null;
            if (item.nodeType !== tokens_1.Token.Package) {
                throw new Error('Expression not a package');
            }
            let children = [];
            let imports = [];
            for (let i = 0, len = item.children.length; i < len; i++) {
                let child = item.children[i];
                if (child.nodeType !== tokens_1.Token.Import) {
                    children.push(child);
                    continue;
                }
                imports.push(this.import(child, options, ctx));
            }
            item.imports = yield Promise.all(imports);
            item.children = children;
            item.fileName = options.fileName;
            return item;
        });
    }
    detectCircularDependencies(path, ctx) {
        if (ctx.previousParent == path) {
            let e = `circle dependencies detected: ${Path.basename(path)} and ${Path.basename(ctx.parent)} depends on eachother`;
            throw new Error(e);
        }
        ctx.previousParent = ctx.parent;
        ctx.parent = path;
    }
    import(item, options, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let dirName = Path.dirname(options.fileName);
            let path = Path.resolve(dirName, normalizePath(item.path));
            this.detectCircularDependencies(path, ctx);
            let data = yield fs.readFile(path);
            let ast = Parser.parse(data.toString());
            if (!(ast instanceof expressions_1.PackageExpression)) {
                throw Error('fatal: this sould never happen');
            }
            let o = Object.assign({}, options, {
                fileName: path
            });
            let p = yield this._parse(ast, o, ctx);
            let i = new expressions_1.ImportedPackageExpression(p);
            i.as = item.as;
            return i;
        });
    }
    getInner(exp) {
        switch (exp.type.nodeType) {
            case tokens_1.Token.ImportType:
            case tokens_1.Token.MapType:
            case tokens_1.Token.UserType:
            case tokens_1.Token.PrimitiveType: return exp.type;
            default: return this.getInner(exp.type);
        }
    }
    validate(item, options) {
        let imports = this.getImports(item);
        let models = this.getModels(item);
        let scope, errors = [];
        try {
            scope = this.getScope(item);
        }
        catch (e) {
            errors.push(e);
        }
        for (let model of models) {
            errors.push(...this.validateModel(model, imports, options, scope));
        }
        if (errors.length) {
            throw new errors_1.ValidationError("ValidationError", errors);
        }
    }
    validateModel(record, imports, options = null, scope) {
        let errors = [];
        if (options) {
            let e = this.validateAnnotations(record, options);
            if (e.length)
                errors.push(...e);
        }
        for (let prop of record.properties) {
            if (options) {
                errors.push(...this.validateAnnotations(prop, options));
            }
            errors.push(...this.validateType(prop, imports, scope));
        }
        return errors;
    }
    validateAnnotations(item, options) {
        let annotations = item.annotations;
        let isRecord = item.nodeType === tokens_1.Token.Record;
        let checkers = (isRecord ? options.records : options.properties) || {};
        let errors = [];
        for (let a of annotations) {
            if (!checkers[a.name]) {
                continue;
            }
            if (!checkers[a.name].validate(a.args)) {
                errors.push(new errors_1.AnnotationValidationError(`Invalid annotation argument for ${a.name} on ${item.name}`, a.position, checkers[a.name].input, typeof a.args));
            }
        }
        return errors;
    }
    _getScope(item, memo) {
        let ass = (item instanceof expressions_1.ImportedPackageExpression) ? item.as : undefined;
        for (let child of item.children) {
            let name = function (child) {
                switch (child.nodeType) {
                    case tokens_1.Token.Record: return child.name;
                    case tokens_1.Token.StringEnum: return child.name;
                    case tokens_1.Token.NumericEnum: return child.name;
                    default: return null;
                }
            }(child);
            if (name === null)
                continue;
            name = ass ? `${ass}.${name}` : name;
            if (memo[name])
                throw new errors_1.ValidationError(`type ${name} already defined in scope`);
            memo[name] = item.fileName;
        }
    }
    getScope(item) {
        let memo = {};
        this._getScope(item, memo);
        for (let i of item.imports) {
            this._getScope(i, memo);
        }
        return memo;
    }
    // Validate a property type
    validateType(item, imports, scope) {
        let type = this.getInner(item);
        switch (type.nodeType) {
            case tokens_1.Token.ImportType:
                return this._validateImport(item, type, imports);
            case tokens_1.Token.PrimitiveType:
                return [];
        }
        if (type.nodeType != tokens_1.Token.UserType)
            return [];
        let name = type.name;
        if (!scope[name])
            return [new errors_1.ValidationError(`could not resolve type: ${name}`, {
                    property: item.name,
                    type: name,
                    position: type.position
                })];
        return [];
    }
    // Validate an imported type 
    // TODO: refactor to use scope
    _validateImport(item, type, imports) {
        let found = !!imports.find(m => m[0] == type.packageName && m[1] == type.name);
        if (!found) {
            return [new errors_1.ValidationError(`imported usertype: "${type.packageName}.${type.name}", could not be resolved`, {
                    property: item.name,
                    type: type.name,
                    position: type.position
                })];
        }
        return [];
    }
    getModels(item) {
        return item.children.filter(m => m.nodeType == tokens_1.Token.Record);
    }
    getImports(item) {
        let include = [tokens_1.Token.Record, tokens_1.Token.StringEnum, tokens_1.Token.NumericEnum];
        let imports = item.imports.map(m => {
            return m.children.filter(mm => include.indexOf(mm.nodeType) > -1).map(mm => [m.as || m.name, mm.name]);
        });
        return _.flatten(imports);
    }
}
exports.Preprocesser = Preprocesser;
