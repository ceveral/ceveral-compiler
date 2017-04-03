"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visitor_1 = require("./visitor");
const Parser = require("./parser");
class Validator {
    constructor(input, checker) {
        this.input = input;
        this.checker = checker;
    }
    validate(input) {
        return this.checker(input);
    }
    static create(input) {
        let visitor = new visitor_1.Visitor();
        let exp = Parser.parse(input);
        return new Validator(input, visitor.parse(exp));
    }
}
exports.Validator = Validator;
