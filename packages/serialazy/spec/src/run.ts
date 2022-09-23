import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import fs = require('fs');
import Mocha = require('mocha');
import path = require('path');

// register chai plugins
chai.use(chaiAsPromised);

function listFilesRecursive(fname: string) {
    let files: string[] = [];
    const stat = fs.lstatSync(fname);
    if (stat.isFile()) {
        files.push(fname);
    } else if (stat.isDirectory()) {
        fs.readdirSync(fname).forEach(nested => {
            files = files.concat(listFilesRecursive(path.join(fname, nested)));
        });
    }
    return files;
}

let mocha = new Mocha({ reporter: 'spec', timeout: 10000 });

// search for spec files recursively
listFilesRecursive(__dirname)
    .filter(fname => fname.endsWith('spec.js'))
    .forEach(fname => mocha.addFile(fname));

mocha.run(failureCount => {
    process.exitCode = failureCount;
});
