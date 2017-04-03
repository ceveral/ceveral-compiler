const fs = require('fs'),
    Parser = require('./lib/parser'),
    Preprocesser = require('./lib/preprocesser').Preprocesser;
    util = require('util');

if (process.argv.length < 3) {
    console.log('usage: ast <path>');
    process.exit(1);
}

let path = process.argv[2];

let buffer = fs.readFileSync(path);

let ast = Parser.parse(buffer.toString('utf-8'));

let p = new Preprocesser();

p.parse(ast, {fileName: path})
.then( ast => {
    //console.log(util.inspect(ast.toJSON(false, true), false, 10, true))
}).catch(console.error.bind(console))

