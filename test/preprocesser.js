"use strict";
const lib_1 = require("../lib");
const Parser = require("../lib/parser");
const fs = require("fs");
const Path = require("path");
describe('Preprecesser', () => {
    it('should validate imports', (done) => {
        let file = Path.join(__dirname, "fixtures/person.cev");
        let input = fs.readFileSync(file, 'utf8');
        let ast = Parser.parse(input);
        let pre = new lib_1.Preprocesser();
        pre.parse(ast, { fileName: file })
            .then((_) => {
            done();
        }).catch((e) => {
            console.log(e);
            done(e);
        });
    });
});
