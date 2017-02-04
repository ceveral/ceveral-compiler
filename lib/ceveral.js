"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const repository_1 = require("./repository");
const transpiler_1 = require("./transpiler");
class Ceveral {
    constructor() {
        this.repository = new repository_1.Repository();
        this.transpiler = new transpiler_1.Transpiler();
        this._initialized = false;
    }
    transform(input, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._initialized)
                throw new Error('ceveral is not setup yet.');
            if (!options.transformers)
                throw new Error('for transformers');
            let transformers = this._getTransformers(options.transformers);
            let files = [];
            for (let transformer of transformers) {
                let opts = repository_1.getAnnotationValidations(transformer) || { fileName: options.fileName };
                let results = yield this.transpiler.transpile(input, transformer, opts);
                if (results) {
                    files.push(...results);
                }
            }
            return files;
        });
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
    _getTransformers(q) {
        let notfound = [];
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
            throw new Error(`Could not find template: ${notfound.join(', ')}`);
        }
        return transformers;
    }
}
exports.Ceveral = Ceveral;
