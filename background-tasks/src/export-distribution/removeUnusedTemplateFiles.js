import fse from 'fs-extra';
import path from 'path';

const removeUnusedTemplateFiles = (args) => {
  const {
    outputDir,
  } = args;

  return fse.readdir(outputDir)
    .then(files => files.filter(name => name !== 'dist'))
    .then(files => Promise.all(files.map(file => fse.remove(path.join(outputDir, file)))))
    .then(() => args);
};

export default removeUnusedTemplateFiles;
