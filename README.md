# jsdifflist

Have you ever been staring at a screenfull of "expected" vs. "actual" JavaScript objects?  Something like this?

```
(node:28742) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): 
Error: Expected { depth: 3, importId: 2, labor: 0, name: 'Maecenas gravida', parentImportId: 1,
qty: 1, unitCost: 39237.55, unitMeasure: 'EA', userId: '' } to equal depth: 3, importId: 2,
labor: 7382.00, name: 'Maecenas gravida', parentImportId: 1, unitCost: 39237.55, unitMeasure:
'EA', userID: '' }
```

Wouldn't you rather it look like this?

![jsdifflist sample image](/docs/jsdifflist-sample-output.jpg)

Now you can!

## Current Limitations

* Only one level supported (i.e., it will not show diffs in array/object properties)
* Only two variables can currently be diffed
* Map/Set diffing not supported

## Usage

Install:

    npm install --save jsdifflist

Import:

    const jsdiff = require('jssdiflist');

Diff two variables:

    const diff = jsdiff(varA, varB);

The return (`diff`) is an array containing all the properties found in `varA` and `varB`, and what the result of the comparison is.

Pretty console output:

    console.log(jsdiff(varA, varB).toString());

HTML output:

    console.log(jsdiff(varA, varB).toHtml());
    
