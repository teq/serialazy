
// tslint:disable-next-line: no-var-requires
const npmPackage = require('../package.json');

export const repositoryUrl = (npmPackage.repository.url as string).replace(/\.git$/, '');

export const packageName = npmPackage.name as string;

export const packageDescription = npmPackage.description as string;

export const packageVersion = npmPackage.version as string;
