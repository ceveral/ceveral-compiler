import { Preprocesser } from '../lib'
import * as Parser from '../lib/parser';
import * as fs from 'fs';
import * as Path from 'path';
describe('Preprecesser', () => {

    it('should validate imports', (done) => {
        let file = Path.join(__dirname, "fixtures/person.cev");
        let input = fs.readFileSync(file, 'utf8');

        let ast = Parser.parse(input);


        let pre = new Preprocesser();

        pre.parse(ast, {fileName: file})
        .then((_) => {
           
            done()
        }).catch((e) => {
            console.log(e)
            done(e)
        });


    })

});