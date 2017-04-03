import * as Path from 'path';
import * as fs from 'fs';
import * as Parser from '../lib/parser';

describe('imports', () => {

     it('should import', () => {
        let file = Path.join(__dirname, "fixtures/person.cev");
        let input = fs.readFileSync(file, 'utf8');

        let ast = Parser.parse(input);
        
    })

})