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
const resolver_1 = require("./resolver");
const validator_1 = require("../options/validator");
const Path = require("path");
const Debug = require("debug");
const debug = Debug('ceveral:resolver');
function getAnnotationValidations(desc) {
    if (!desc.annotations)
        return null;
    let out = { records: {}, properties: {}, fileName: null };
    for (let key of ['properties', 'records']) {
        let an = desc.annotations[key];
        for (let k in an) {
            let a = an[k];
            out[key][k] = validator_1.Validator.create(a.arguments);
        }
    }
    return out;
}
exports.getAnnotationValidations = getAnnotationValidations;
function isDescription(a) {
    if (!a)
        return false;
    return typeof a.name === 'string' && typeof a.transform === 'function';
}
class Repository {
    constructor() {
        this.transformers = {};
    }
    loadTransformers() {
        return __awaiter(this, void 0, void 0, function* () {
            let paths = yield resolver_1.resolver.lookup("ceveral-transformer");
            for (let path of paths) {
                let desc;
                debug('found path %s, trying to load', path);
                try {
                    desc = require(path);
                    if (desc && desc.__esModule) {
                        desc = desc.default;
                    }
                }
                catch (e) {
                    debug('could not load %s: %s', path, e.message);
                    continue;
                }
                let base = Path.basename(Path.dirname(path)).replace('ceveral-transformer-', '');
                debug('found transformer "%s" at path "%s"', desc.name, path);
                if (isDescription(desc))
                    this.transformers[base] = desc;
            }
        });
    }
    getTransformer(name) {
        if (this.transformers[name])
            return this.transformers[name];
        for (let key in this.transformers) {
            let v = this.transformers[key];
            if (v.name === name)
                return v;
        }
        return null;
    }
}
exports.Repository = Repository;
