"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../lib/utils");
const should = require("should");
describe('Once', () => {
    it('should call initializer exactly once', (done) => {
        var called = 0;
        let once = new utils_1.Once(() => {
            return ++called;
        });
        let promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(once.call());
        }
        Promise.all(promises).then((o) => {
            o.forEach(o => should(o).equal(1));
            should(called).be.equal(1);
            done();
        }).catch(done);
    });
});
