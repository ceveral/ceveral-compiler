"use strict";
const Parser = require("../lib/parser");
const tokens_1 = require("../lib/tokens");
const expressions_1 = require("../lib/expressions");
const should = require("should");
describe('Parser', () => {
    it('should parse package', () => {
        let ast = Parser.parse(`package main;`);
        should(ast.nodeType).equal(tokens_1.Token.Package);
        should(ast.children).be.null();
        should(ast.name).equal('main');
    });
    it('should parse message', () => {
        let ast = Parser.parse(`
            package main;
            record Name {
                name: string;
            }
        `);
        should(ast.nodeType).equal(tokens_1.Token.Package);
        should(ast.children.length).equal(1);
        let record = ast.children[0];
        should(record.nodeType).equal(tokens_1.Token.Record);
        should(record.name).equal("Name");
        should(record.properties.length).equal(1);
        should(record.annotations.length).equal(0);
        let prop = record.properties[0];
        should(prop.nodeType).equal(tokens_1.Token.Property);
        should(prop.name).equal('name');
        should(prop.type).instanceOf(expressions_1.TypeExpression);
        should(prop.type.nodeType).equal(tokens_1.Token.PrimitiveType);
        should(prop.type.type).equal(tokens_1.Type.String);
        should(prop.annotations.length).equal(0);
    });
});
