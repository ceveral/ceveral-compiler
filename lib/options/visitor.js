"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expressions_1 = require("./expressions");
function isString(a) {
    return typeof a === 'string';
}
function isBoolean(a) {
    return typeof a === 'boolean';
}
function isNumber(a) {
    return typeof a === 'number';
}
const slice = Array.prototype.slice;
function checkArgument() {
    var args = slice.call(arguments);
    return function (arg) {
        for (var i = 0, len = args.length; i < len; i++) {
            if (args[i](arg) === true)
                return true;
        }
        return false;
    };
}
function check(checkers, a) {
    for (let check of checkers) {
        if (check(a))
            return true;
    }
    return false;
}
function checkArray() {
    var checkers = slice.call(arguments);
    return function (args) {
        if (!Array.isArray(args))
            return false;
        for (let a of args) {
            if (!check(checkers, a))
                return false;
        }
        return true;
    };
}
function checkTypedObject(_) {
    return function (args) {
        if (typeof args !== 'object')
            return false;
    };
}
function checkObject(...checkers) {
    return function (args) {
        if (typeof args !== 'object')
            return false;
        for (let key in args) {
            if (!check(checkers, args[key]))
                return false;
        }
        return true;
    };
}
class Visitor {
    parse(exp) {
        let out = new Function('o', `return ${this.visit(exp)}`)({
            checkArgument, checkArray, checkObject, checkTypedObject,
            isString, isNumber, isBoolean
        });
        return out;
    }
    visit(exp) {
        switch (exp.nodeType) {
            case expressions_1.NodeType.Argument: return this.visitArgument(exp);
            case expressions_1.NodeType.PrimitiveType: return this.visitPrimitive(exp);
            case expressions_1.NodeType.ArrayType: return this.visitArray(exp);
            case expressions_1.NodeType.ObjectType: return this.visitObject(exp);
            case expressions_1.NodeType.TypedObjectType: return this.visitTypedObject(exp);
        }
    }
    visitArgument(exp) {
        let checkers = exp.types.map(m => this.visit(m));
        return `o.checkArgument(${checkers.join(',')})`;
    }
    visitPrimitive(exp) {
        switch (exp.type) {
            case expressions_1.PrimitiveType.String: return 'o.isString';
            case expressions_1.PrimitiveType.Number: return 'o.isNumber';
            case expressions_1.PrimitiveType.Boolean: return 'o.isBoolean';
        }
    }
    visitArray(exp) {
        let checkers = exp.types.map(m => this.visit(m));
        return `o.checkArray(${checkers.join(',')})`;
    }
    visitObject(exp) {
        let checkers = exp.types.types.map(m => this.visit(m));
        return `o.checkObject(${checkers.join(',')})`;
    }
    visitTypedObject(exp) {
        return `o.checkTypedObject(${exp.properties})`;
    }
}
exports.Visitor = Visitor;
