import * as Parser from '../lib/parser';
import { Token, Type } from '../lib/tokens';
import { RecordExpression, TypeExpression } from '../lib/expressions'
import * as should from 'should';


describe('Parser', () => {

    it('should parse package', () => {
        const check = (ast) => {
            should(ast.nodeType).equal(Token.Package);
            should(ast.children).be.null();
            should(ast.name).equal('main');
        }

        check(Parser.parse(`package main;`));
        check(Parser.parse("package main "));
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

        let record = ast.children[0] as RecordExpression;

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

    });

    it('should parse numeric enum', () => {
        let ast = Parser.parse(`
            package main;
            enum Enum {
                Member1 = 1;
                Member2;
            }
        `);


    });

    it('should parse string enum', () => {
        let ast = Parser.parse(`
            package main;
            enum Enum {
                Member1 = "hello";
                Member2 = "helloe2";
            }
        `);


    })

   

});