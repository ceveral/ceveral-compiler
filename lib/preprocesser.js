"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tokens_1 = require("./tokens");
const expressions_1 = require("./expressions");
const Path = require("path");
const Parser = require("./parser");
const fs = require("mz/fs");
const errors_1 = require("./errors");
const Debug = require("debug");
const debug = Debug('ceveral:preprocesser');
const _ = require("lodash");
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
            let pack = yield this.process(item, options);
            this.validate(pack, options);
            return pack;
        });
    }
    process(item, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item)
                return null;
            if (item.nodeType !== tokens_1.Token.Package) {
                throw new Error('Expression not a package');
            }
            let e = item;
            e.imports = [];
            let children = [];
            for (let i = 0, len = e.children.length; i < len; i++) {
                let child = e.children[i];
                if (child.nodeType !== tokens_1.Token.Import) {
                    children.push(child);
                    continue;
                }
                e.imports.push(yield this.import(child, options));
            }
            e.children = children;
            e.fileName = options.fileName;
            return e;
        });
    }
    detectCircularDependencies(path) {
        if (this.previousParent == path) {
            let e = `circle dependencies detected: ${Path.basename(path)} and ${Path.basename(this.parent)} depends on eachother`;
            throw new Error(e);
        }
        this.previousParent = this.parent;
        this.parent = path;
    }
    import(item, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let dirName = Path.dirname(options.fileName);
            let path = Path.resolve(dirName, item.path + ".cev");
            this.detectCircularDependencies(path);
            let data = yield fs.readFile(path);
            let ast = Parser.parse(data.toString());
            if (!(ast instanceof expressions_1.PackageExpression)) {
                throw Error('ERROR');
            }
            let o = Object.assign({}, options, {
                fileName: path
            });
            let p = yield this.parse(ast, o);
            return p;
        });
    }
    getInner(exp) {
        switch (exp.type.nodeType) {
            case tokens_1.Token.ImportType:
            case tokens_1.Token.MapType:
            case tokens_1.Token.RecordType:
            case tokens_1.Token.PrimitiveType: return exp.type;
            default: return this.getInner(exp.type);
        }
    }
    validate(item, options) {
        let imports = this.getImports(item);
        let models = this.getModels(item);
        let errors = [];
        for (let model of models) {
            errors.push(...this.validateModel(model, imports, options));
        }
        if (errors.length) {
            throw new errors_1.ValidationError("errors", errors);
        }
    }
    validateModel(record, imports, options) {
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
            errors.push(...this.validateImport(prop, imports));
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
    validateImport(item, imports) {
        let type = this.getInner(item);
        if (type.nodeType !== tokens_1.Token.ImportType)
            return [];
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
            return m.children.filter(mm => include.indexOf(mm.nodeType) > -1).map(mm => [m.name, mm.name]);
        });
        return _.flatten(imports);
    }
}
exports.Preprocesser = Preprocesser;
