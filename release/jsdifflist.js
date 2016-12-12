'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var chalk = require('chalk');
var Table = require('easy-table');
var isEqual = require('is-equal');
var escapeHtml = require('escape-html');

function equalityType(values) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (values.length !== 2) throw new Error('Currently, only comparison between two objects is supported.');
    if (values[0] === values[1]) return { values: values, result: 'strict', colorHint: 'green' };
    if (values[0] == values[1]) return { values: values, result: 'loose', colorHint: 'yellow' };
    if (isEqual(values[0], values[1])) return { values: values, result: 'conceptual', colorHint: 'yellow' };
    return { values: values, result: 'unequal', colorHint: 'red' };
}

function objdiff(objs) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (objs.length !== 2) throw new Error('Currently, only comparison between two objects is supported.');
    // TODO: (enhancement) diff Map and Set objects
    // TODO: (enhancement) Symbol properties
    // TODO: (enhancement) option to include non-enumerable properties
    // TODO: (enhancement) option to highlight/exclude prototype properties
    var allKeys = [].concat(_toConsumableArray(new Set([].concat(_toConsumableArray(Object.keys(objs[0])), _toConsumableArray(Object.keys(objs[1]))))));
    if (typeof opts.sortKeys === 'function') allKeys = allKeys.sort(opts.sortKeys);
    if (opts.sortKeys) allKeys = allKeys.sort();

    return allKeys.map(function (key) {
        return Object.assign({ key: key }, equalityType(objs.map(function (obj) {
            return obj[key];
        }), opts));
    });
}

function arraydiff(arrs) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (arrs.length !== 2) throw new Error('Currently, only comparison between two arrays is supported.');
    // possibly a more efficient way to do this?
    var allIndexes = new Array(Math.max.apply(Math, _toConsumableArray(arrs.map(function (arr) {
        return arr.length;
    })))).fill(null).map(function (x, i) {
        return i;
    });
    return allIndexes.map(function (index) {
        return Object.assign({ index: index }, equalityType(arrs.map(function (arr) {
            return arr[index];
        }), opts));
    });
}

function diff(comparands, opts) {
    if (comparands.every(function (c) {
        return c === null;
    })) return equalityType(comparands, opts);
    if (comparands.every(function (c) {
        return (typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object';
    })) {
        if (comparands.every(function (c) {
            return Array.isArray(c);
        })) return arraydiff(comparands, opts);
        if (comparands.some(function (c) {
            return Array.isArray(c);
        })) return equalityType(comparands, opts);
        return objdiff(comparands, opts);
    }
    return equalityType(comparands, opts);
}

module.exports = function (a, b) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof opts.numberFormat !== 'function') opts.numberFormat = function (n) {
        return n;
    };
    if (!opts.labels) opts.labels = ['Object A', 'Object B'];

    function formatValue(v) {
        if (v === null) return 'null'; // avoid JavaScript's brain-dead 'typeof' behavior wrt null
        switch (typeof v === 'undefined' ? 'undefined' : _typeof(v)) {
            case 'string':
                return '"' + v.replace(/"/g, '\/"') + '"';
            case 'number':
                return opts.numberFormat(v);
            case 'object':
                return Array.isArray(v) ? 'Array' : 'Object';
            // all other types have reasonable string representations
            default:
                return v;
        }
    }

    var results = diff([a, b], opts);

    Object.defineProperties(results, {
        toString: {
            isEnumerable: false,
            value: function value() {
                var t = new Table();

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _diff = _step.value;

                        t.cell('Property', chalk[_diff.colorHint](_diff.key));
                        t.cell('Equality', _diff.result);
                        t.cell(opts.labels[0], chalk[_diff.colorHint](formatValue(_diff.values[0])));
                        t.cell(opts.labels[1], chalk[_diff.colorHint](formatValue(_diff.values[1])));
                        t.newRow();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return chalk.green('Green: Strictly Equal (===)') + '\n' + chalk.yellow('Yellow: Conceptually Equal (courtesy is-equal)') + '\n' + chalk.red('Red: Not Equal') + '\n\n' + t.toString();
            }
        },
        toHtml: {
            isEnumerable: false,
            value: function value() {
                return '<table class="jsdifflist">' + '<thead><tr>' + '<th>Property</th>' + '<th>Equality</th>' + ('<th>' + opts.labels[0] + '</th>') + ('<th>' + opts.labels[1] + '</th>') + '</tr></thead>' + '<tbody>' + this.map(function (d) {
                    return '<tr class="jsdifflist-color-' + d.colorHint + '">' + ('<td>' + escapeHtml(d.key) + '</td>') + ('<td>' + d.result + '</td>') + ('<td>' + escapeHtml(formatValue(d.values[0])) + '</td>') + ('<td>' + escapeHtml(formatValue(d.values[1])) + '</td></tr>');
                }).join('') + '</tbody></table>';
            }
        }
    });

    return results;
};
//# sourceMappingURL=jsdifflist.js.map