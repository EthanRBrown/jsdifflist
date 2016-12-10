'use strict';

const chalk = require('chalk');
const Table = require('easy-table');
const isEqual = require('is-equal');

function equalityType(values, opts = {}) {
    if(values.length !== 2) throw new Error('Currently, only comparison between two objects is supported.');
    if(values[0] === values[1]) return { values, result: 'strict', colorHint: 'green' };
    if(values[0] == values[1]) return { values, result: 'loose', colorHint: 'yellow' };
    if(isEqual(values[0], values[1])) return { values, result: 'conceptual', colorHint: 'yellow' };
    return { values, result: 'unequal', colorHint: 'red' };
}

function objdiff(objs, opts = {}) {
    if(objs.length !== 2) throw new Error('Currently, only comparison between two objects is supported.');
    // TODO: (enhancement) diff Map and Set objects
    // TODO: (enhancement) Symbol properties
    // TODO: (enhancement) option to include non-enumerable properties
    // TODO: (enhancement) option to highlight/exclude prototype properties
    let allKeys = [...new Set([...Object.keys(objs[0]), ...Object.keys(objs[1])])];
    if(typeof opts.sortKeys === 'function') allKeys = allKeys.sort(opts.sortKeys);
    if(opts.sortKeys) allKeys = allKeys.sort();

    return allKeys.map(key => Object.assign({ key }, equalityType(objs.map(obj => obj[key]), opts)));
}

function arraydiff(arrs, opts = {}) {
    if(arrs.length !== 2) throw new Error('Currently, only comparison between two arrays is supported.');
    // possibly a more efficient way to do this?
    const allIndexes = new Array(Math.max(arrs.map(arr => arr.length))).fill(null).map((x, i) => i);
    return allIndexes.map(index => Object.assign({ index }, equalityType(arrs.map(arr => arr[index]), opts)));
}

module.exports = function(a, b, opts = {}) {
    const comparands = [a, b];
    if(comparands.every(c => c === null)) return equalityType(comparands, opts);
    if(comparands.every(c => typeof c === 'object')) {
        if(!comparands.every(c => Array.isArray(c))) return equalityType(comparands, opts);
        return comparands.every(c => Array.isArray(c)) ? arrdiff(comparands, opts) : objdiff(comparands, opts);
    }
    return equalityType(comparands, opts);
}

/*
module.exports = function(a, b, opts = {}) {
    if(typeof opts.numberFormat !== 'function') opts.numberFormat = n => n;

    const allKeys = [...new Set([...Object.keys(a), ...Object.keys(b)])];

    const t = new Table();

    function formatValue(v, color) {
        if(v === null) return chalk[color]('null'); // avoid JavaScript's brain-dead 'typeof' behavior wrt null
        switch(typeof v) {
            case 'string': return chalk[color]('"' + v.replace(/"/g, '\/"') + '"');
            case 'number': return chalk[color](opts.numberFormat(v));
            case 'object': return chalk[color](Array.isArray(v) ? 'Array' : 'Object');
            // all other types have reasonable string representations
            default: return chalk[color](v);
        }
    }

    for(const key of allKeys) {
        const color = a[key]===b[key] ? 'green' :
            isEqual(a[key], b[key]) ? 'yellow' : 'red';
        t.cell('Property', chalk[color](key));
        t.cell('Object A', formatValue(a[key], color));
        t.cell('Object B', formatValue(b[key], color));
        t.newRow();
    }

    console.log(chalk.green('Green: Strictly Equal (===)'));
    console.log(chalk.yellow('Yellow: Conceptually Equal (courtesy is-equal)'));
    console.log(chalk.red('Red: Not Equal'));
    console.log('\n' + t.toString());
}
*/

/*
const a = { hey: 'a', nonny: 'b', no: 'c', x: '3', a: [1,2,3] };
const b = { hey: 'a', nonny: 1, is: 2, fer: 3, horses: 4, x: 3, a: [1,2,3] };

console.log(module.exports(a, b));
*/
