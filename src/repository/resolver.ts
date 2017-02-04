
import * as Path from 'path';
import * as globby from 'globby';
import * as  _ from 'lodash';
import * as Debug from 'debug';
import * as fs from 'mz/fs';

const debug = Debug('ceveral:resolver');

const win32 = process.platform === 'win32';

export namespace resolver {
    export const lookups = ['.', 'generators', 'lib/generators'];


    /**
     * Search for generators and their sub generators.
     *
     * A generator is a `:lookup/:name/index.js` file placed inside an npm package.
     *
     * Defaults lookups are:
     *   - ./
     *   - generators/
     *   - lib/generators/
     *
     * So this index file `node_modules/generator-dummy/lib/generators/yo/index.js` would be
     * registered as `dummy:yo` generator.
     *
     * @param {function} cb - Callback called once the lookup is done. Take err as first
     *                        parameter.
     */
    export async function lookup(prefix:string) {
        var generatorsModules = await findGeneratorsIn(getNpmPaths(), prefix);
        var patterns: string[] = [];

        lookups.forEach(function (lookup) {
            generatorsModules.forEach(function (modulePath) {
                patterns.push(Path.join(modulePath, lookup));
            });
        });
        
        let out: string[] = [];
        patterns.forEach(function (pattern) {
            
            globby.sync('index.js', { cwd: pattern }).forEach(function (filename) {    
                out.push(tryRegistering(Path.join(pattern, filename)))
            }, this);
        }, this);

        return out.filter(m => m != null);
    }

    /**
     * Search npm for every available generators.
     * Generators are npm packages who's name start with `generator-` and who're placed in the
     * top level `node_module` path. They can be installed globally or locally.
     *
     * @param {Array}  List of search paths
     * @return {Array} List of the generator modules path
     */
    async function findGeneratorsIn(searchPaths: string[], prefix:string): Promise<string[]> {
        var modules = [];
        
        for (let root of searchPaths) {
            let match = await globby([
                `${prefix}-*`,
                `@*/${prefix}-*`
            ], { cwd: root });
            modules.push(...match.map(m => Path.join(root, m)))
        }

        return modules;
    };
    /**
     * Try registering a Generator to this environment.
     * @private
     * @param  {String} generatorReference A generator reference, usually a file path.
     */
    function tryRegistering(generatorReference) {
        var namespace;
        var realPath = fs.realpathSync(generatorReference);

        try {
            debug('found %s, trying to register', generatorReference);

            if (realPath !== generatorReference) {
                //console.log(realPath, generatorReference)
                //namespace = this.namespace(generatorReference);
            }
            return realPath;
            //this.register(realPath, namespace);
        } catch (e) {
            console.error('Unable to register %s (Error: %s)', generatorReference, e.message);
        }

        return null;
    };


    /**
     * Get the npm lookup directories (`node_modules/`)
     * @return {Array} lookup paths
     */
    function getNpmPaths() {
        var paths: string[] = [];

        // Add NVM prefix directory
        if (process.env.NVM_PATH) {
            paths.push(Path.join(Path.dirname(process.env.NVM_PATH), 'node_modules'));
        }

        // Adding global npm directories
        // We tried using npm to get the global modules path, but it haven't work out
        // because of bugs in the parseable implementation of `ls` command and mostly
        // performance issues. So, we go with our best bet for now.
        if (process.env.NODE_PATH) {
            paths = _.compact<string>(process.env.NODE_PATH.split(Path.delimiter)).concat(paths);
        }

        // global node_modules should be 4 or 2 directory up this one (most of the time)
        paths.push(Path.join(__dirname, '../../../..'));
        paths.push(Path.join(__dirname, '../..'));

        // adds support for generator resolving when yeoman-generator has been linked
        if (process.argv[1]) {
            paths.push(Path.join(Path.dirname(process.argv[1]), '../..'));
        }

        // Default paths for each system
        if (win32) {
            paths.push(Path.join(process.env.APPDATA, 'npm/node_modules'));
        } else {
            paths.push('/usr/lib/node_modules');
            paths.push('/usr/local/lib/node_modules');
        }
        paths = paths.concat(require('global-modules'))
        // Walk up the CWD and add `node_modules/` folder lookup on each level
        process.cwd().split(Path.sep).forEach(function (_, i, parts) {
            var lookup = Path.join.apply(Path, parts.slice(0, i + 1).concat(['node_modules']));

            if (!win32) {
                lookup = '/' + lookup;
            }

            paths.push(lookup);
        });

        return paths.reverse();
    };

}
