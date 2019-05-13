const fse = require('fs-extra');
const path = require('path');

const { spawnSync } = require('child_process');

const templatePackageJsonPath = require.resolve('@bbc/bbcat-orchestration-template/package.json');

console.log('Installing devDependencies for @bbc/bbcat-orchestration-template:');

fse.readJson(templatePackageJsonPath)
  .then((templatePackage) => {
    console.log('rewriting package.json', templatePackage.version);
    console.log(templatePackageJsonPath);

    const newPackage = {
      ...templatePackage,
      dependencies: {
        ...(templatePackage.dependencies || {}),
        ...(templatePackage.devDependencies || {}),
      },
      devDependencies: [],
    };

    return fse.writeJson(templatePackageJsonPath, newPackage, { spaces: 2 });
  })
  .then(() => {
    console.log('installing');
    spawnSync(
      'yarn',
      ['install'],
      {
        cwd: path.dirname(templatePackageJsonPath),
        stdio: 'inherit',
      },
    );
  });
