export declare namespace resolver {
    const lookups: string[];
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
    function lookup(prefix: string): Promise<string[]>;
}
