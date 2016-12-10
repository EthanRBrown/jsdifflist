'use strict';
require('source-map-support').install();

const path = require('path');
const tape = require('tape');
const diff = require(path.resolve(__dirname, '..', 'dist', 'jsdifflist.js'));

tape('primative compares (strict)', t => {
    t.plan(5);
    t.equal(diff(null, null).result, 'strict');
    t.equal(diff(undefined, undefined).result, 'strict');
    t.equal(diff(true, true).result, 'strict');
    t.equal(diff(1, 1).result, 'strict');
    t.equal(diff('s', 's').result, 'strict');
});

tape('primative compares (loose)', t => {
    t.plan(3);
    t.equal(diff(null, undefined).result, 'loose');
    t.equal(diff(1, "1").result, 'loose');
    t.equal(diff(false, 0).result, 'loose');
});

tape('primative compares (unequal)', t => {
    t.plan(3);
    t.equal(diff(null, false).result, 'unequal');
    t.equal(diff(1, "one").result, 'unequal');
    t.equal(diff(false, "false").result, 'unequal');
});

tape('object vs array', t => {
    t.plan(1);
    t.equal(diff({}, []).result, 'unequal');
});

tape('object vs primative', t => {
    t.plan(1);
    t.equal(diff({}, 1).result, 'unequal');
});

tape('array vs primative', t => {
    t.plan(1);
    t.equal(diff([], 1).result, 'unequal');
});
