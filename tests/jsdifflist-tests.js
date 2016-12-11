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

tape('objects (strict)', t => {
    const innerObj = {};
    const innerArr = [];
    const objA = {
        a: null,
        b: undefined,
        c: true,
        d: 1,
        e: 's',
        f: {},
        g: [],
    };
    const diffs = diff(objA, Object.assign({}, objA));
    t.plan(diffs.length + 1);
    t.equal(diffs.length, Object.keys(objA).length, 'key count mismatch');
    for(const d of diffs)
       t.equal(d.result, 'strict'); 
});

tape('objects (loose)', t => {
    const innerObj = {};
    const innerArr = [];
    const objA = {
        a: null,
        b: 1,
        c: false,
    };
    const objB = {
        a: undefined,
        b: "1",
        c: 0,
    };
    const diffs = diff(objA, objB);
    t.plan(diffs.length);
    for(const d of diffs)
       t.equal(d.result, 'loose'); 
});

tape('objects (conceptual)', t => {
    const objA = {
        a: { x: 1, y: 2, z: 3 },
        b: [ 10, 11, 12 ],
    };
    const objB = {
        a: { x: 1, y: 2, z: 3 },
        b: [ 10, 11, 12 ],
    };
    const diffs = diff(objA, objB);
    t.plan(diffs.length);
    for(const d of diffs)
       t.equal(d.result, 'conceptual'); 
});

tape('objects (unequal)', t => {
    const innerObj = {};
    const innerArr = [];
    const objA = {
        a: 1,
        b: true,
        c: 'a',
        d: [],
        e: {},
    };
    const objB = {
        a: 2,
        b: false,
        c: 'x',
        d: [1],
        e: {a: 1},
    };
    const diffs = diff(objA, objB);
    t.plan(diffs.length + 1);
    t.equal(diffs.length, Object.keys(objA).length, 'key count mismatch');
    for(const d of diffs)
       t.equal(d.result, 'unequal'); 
});

tape('arrays (strict)', t => {
    const innerObj = {};
    const innerArr = [];
    const arrA = [
        null,
        undefined,
        true,
        1,
        's',
        {},
        [],
    ];
    const diffs = diff(arrA, [...arrA]);
    t.plan(diffs.length + 1);
    t.equal(diffs.length, arrA.length, 'key count mismatch');
    for(const d of diffs)
       t.equal(d.result, 'strict'); 
});

tape('arrays (loose)', t => {
    const innerObj = {};
    const innerArr = [];
    const arrA = [
        null,
        1,
        false,
    ];
    const arrB = [
        undefined,
        "1",
        0,
    ];
    const diffs = diff(arrA, arrB);
    t.plan(diffs.length);
    for(const d of diffs)
       t.equal(d.result, 'loose'); 
});

tape('arrays (conceptual)', t => {
    const arrA = [
        { x: 1, y: 2, z: 3 },
        [ 10, 11, 12 ],
    ];
    const arrB = [
        { x: 1, y: 2, z: 3 },
        [ 10, 11, 12 ],
    ];
    const diffs = diff(arrA, arrB);
    t.plan(diffs.length);
    for(const d of diffs)
       t.equal(d.result, 'conceptual'); 
});

tape('arrays (unequal)', t => {
    const innerObj = {};
    const innerArr = [];
    const arrA = [
        1,
        true,
        'a',
        {},
        [],
    ];
    const arrB = [
        2,
        false,
        'x',
        {a: 1},
        [1],
    ];
    const diffs = diff(arrA, arrB);
    t.plan(diffs.length + 1);
    t.equal(diffs.length, arrA.length, 'key count mismatch');
    for(const d of diffs)
       t.equal(d.result, 'unequal'); 
});

tape('objects with disjoint keys'), t => {
    const objA = { a: 1, b: 2, c: 3 };
    const objB = { x: 1, y: 2, z: 3 };
    const diffs = diff(objA, objB);
    t.plan(diffs.length + 1);
    t.equal(diffs.length, 6, 'incorrect aggregate property count');
    for(const d of diffs)
        t.equal(d.result, 'unequal');
}

tape('objects with shared and unshared keys'), t => {
    const objA = { a: 1, b: 2, c: 3 };
    const objB = { x: 1, b: 2, z: 3 };
    const diffs = diff(objA, objB);
    t.plan(diffs.length + 1);
    t.equal(diffs.length, 5, 'incorrect aggregate property count');
    t.equal(diffs.find(x => x.key === 'a').result, 'strict');
    t.equal(diffs.find(x => x.key === 'b').result, 'unequal');
    t.equal(diffs.find(x => x.key === 'c').result, 'unequal');
    t.equal(diffs.find(x => x.key === 'x').result, 'unequal');
    t.equal(diffs.find(x => x.key === 'z').result, 'unequal');
}
