import * as Parser from '../lib/parser';
import {Token, Type} from '../lib/tokens';
import {RecordExpression, TypeExpression} from '../lib/expressions'
import * as should from 'should';
describe('Parser', () => {

    it('should parse package', () => {
        let ast = Parser.parse(`package main;`);

        should(ast.nodeType).equal(Token.Package);
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

        should(ast.nodeType).equal(Token.Package);
        should(ast.children.length).equal(1);

        let record  = ast.children[0] as RecordExpression;

        should(record.nodeType).equal(Token.Record);
        should(record.name).equal("Name");
        should(record.properties.length).equal(1);
        should(record.annotations.length).equal(0);

        let prop = record.properties[0];
        should(prop.nodeType).equal(Token.Property)
        should(prop.name).equal('name');
        should(prop.type).instanceOf(TypeExpression);
        should((prop.type as TypeExpression).nodeType).equal(Token.PrimitiveType);
        should((prop.type as TypeExpression).type).equal(Type.String);
        should(prop.annotations.length).equal(0);

    })

});