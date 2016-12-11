'use strict';

const chalk = require('chalk');
const Table = require('easy-table');
const isEqual = require('is-equal');
const escapeHtml = require('escape-html');

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
    const allIndexes = new Array(Math.max(...arrs.map(arr => arr.length))).fill(null).map((x, i) => i);
    return allIndexes.map(index => Object.assign({ index }, equalityType(arrs.map(arr => arr[index]), opts)));
}

function diff(comparands, opts) {
    if(comparands.every(c => c === null)) return equalityType(comparands, opts);
    if(comparands.every(c => typeof c === 'object')) {
        if(comparands.every(c => Array.isArray(c))) return arraydiff(comparands, opts);
        if(comparands.some(c => Array.isArray(c))) return equalityType(comparands, opts);
        return objdiff(comparands, opts);
    }
    return equalityType(comparands, opts);
}


module.exports = function(a, b, opts = {}) {
    if(typeof opts.numberFormat !== 'function') opts.numberFormat = n => n;

    function formatValue(v) {
        if(v === null) return 'null'; // avoid JavaScript's brain-dead 'typeof' behavior wrt null
        switch(typeof v) {
            case 'string': return '"' + v.replace(/"/g, '\/"') + '"';
            case 'number': return opts.numberFormat(v);
            case 'object': return Array.isArray(v) ? 'Array' : 'Object';
            // all other types have reasonable string representations
            default: return v;
        }
    }

    const results = diff([a, b], opts);

    Object.defineProperties(results, {
        toString: {
            isEnumerable: false,
            value() {
                const t = new Table();

                for(const diff of this) {
                    t.cell('Property', chalk[diff.colorHint](diff.key));
                    t.cell('Equality', diff.result);
                    t.cell('Object A', chalk[diff.colorHint](formatValue(diff.values[0])));
                    t.cell('Object B', chalk[diff.colorHint](formatValue(diff.values[1])));
                    t.newRow();
                }

                return chalk.green('Green: Strictly Equal (===)') + '\n' +
                    chalk.yellow('Yellow: Conceptually Equal (courtesy is-equal)') + '\n' +
                    chalk.red('Red: Not Equal') + '\n\n' +
                    t.toString();
            },
        },
        toHtml : {
            isEnumerable: false,
            value() {
                return '<table class="jsdifflist">' +
                    '<thead><tr>' +
                    '<th>Property</th>' +
                    '<th>Equality</th>' +
                    '<th>Object A</th>' +
                    '<th>Object B</th>' +
                    '</tr></thead>' +
                    '<tbody>' +
                    this.map(d => `<tr class="jsdifflist-color-${d.colorHint}">` +
                        `<td>${escapeHtml(d.key)}</td>` +
                        `<td>${d.result}</td>` +
                        `<td>${escapeHtml(formatValue(d.values[0]))}</td>` +
                        `<td>${escapeHtml(formatValue(d.values[1]))}</td></tr>`).join('') +
                    '</tbody></table>';
            },
        },
    });

    return results;
}
