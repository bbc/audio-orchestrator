/* eslint-disable */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const topLerna = require(path.join(__dirname, '../lerna.json'));
const getPackagePath = folder => path.join(__dirname, '../', folder, 'package.json');

console.log('Current versions:');

const packages = topLerna.packages.map((folder) => {
  const packagePath = getPackagePath(folder);
  const packageJson = require(packagePath);
  return {
    name: packageJson.name,
    version: packageJson.version,
    packagePath,
    packageJson,
  };
});

packages.forEach(({ packageJson }) => {
  console.log(`${packageJson.name}\t@ ${packageJson.version}`);
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('>> Enter new version for all packages: ', (version) => {

  packages.forEach(({ packagePath, packageJson }) => {
    packageJson.version = version;

    packages.forEach(({ name }) => {
      if (packageJson.devDependencies && (name in packageJson.dependencies)) {
        packageJson.dependencies[name] = `^${version}`;
      }
      if (packageJson.devDependencies && (name in packageJson.devDependencies)) {
        packageJson.devDependencies[name] = `^${version}`;
      }
    });

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`${packageJson.name}\t updated to ${packageJson.version}`);
  });

  rl.close();
});
