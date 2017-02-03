"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const preprocesser_1 = require("./preprocesser");
const Parser = require("./parser");
const utils_1 = require("./utils");
class Transpiler {
    constructor() {
        this.pre = new preprocesser_1.Preprocesser();
    }
    ast(input, optionsOrFileName) {
        return new Promise((resolve, reject) => {
            let output = Parser.parse(input);
            let o;
            if (utils_1.isString(optionsOrFileName)) {
                o = { fileName: optionsOrFileName };
            }
            else {
                o = optionsOrFileName;
            }
            this.pre.parse(output, o).then(resolve, reject);
        });
    }
    transpile(input, transformer, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let ast = utils_1.isString(input) ? (yield this.ast(input)) : input;
            let result = yield transformer.transform(ast, options);
            return result;
        });
    }
}
exports.Transpiler = Transpiler;
