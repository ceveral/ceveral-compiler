"use strict";
const Path = require("path");
const fs = require("fs");
const Parser = require("../lib/parser");
describe('imports', () => {
    it('should import', () => {
        let file = Path.join(__dirname, "fixtures/person.cev");
        let input = fs.readFileSync(file, 'utf8');
        let ast = Parser.parse(input);
    });
});
