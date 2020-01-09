import fse from 'fs-extra';
import path from 'path';
import templateConfiguration from './templateConfiguration';

const configureTemplateSettings = (args) => {
  const {
    sequences,
    controls,
    settings,
    outputDir,
  } = args;

  // Generate the configuration JSON string to put in
  const configuration = templateConfiguration(sequences, controls, settings);

  // There are two versions of index.html, currently both are the same. Both contain a script
  // tag that sets the configuration and initialises the template.
  const configPaths = [
    path.join(outputDir, 'src', 'presentation', 'index.html'),
    path.join(outputDir, 'dist', 'index.html'),
  ];

  return Promise.all(
    configPaths.map(configPath => fse.readFile(configPath, { encoding: 'utf8' })
      // Replace the configuration in both config files using a regular expression:
      // ?: non-greedy matching.
      // [\s\S] character classes of white space and non white space to include line breaks.
      .then(contents => contents.replace(
        /const config = \{[\s\S]*?\};/,
        `const config = ${configuration};`,
      ))
      // Remove other variable definitions (TODO just remove them from template)
      .then(contents => contents.replace(
        /const [A-Z_]+ = '.*';/g,
        '',
      ))
      .then(updatedContents => fse.writeFile(configPath, updatedContents))),
  ).then(() => args);
};

export default configureTemplateSettings;
