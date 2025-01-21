/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import fse from 'fs-extra';
import path from 'path';
import templateConfiguration from './templateConfiguration.js';

const configureTemplateSettings = (args) => {
  const {
    sequences,
    controls,
    settings,
    outputDir,
    imageUrls,
  } = args;

  // Generate the configuration JSON string to put in
  const configuration = templateConfiguration(sequences, controls, settings, imageUrls);

  // There are two versions of index.html, currently both are the same. Both contain a script
  // tag that sets the configuration and initialises the template.
  const configPaths = [
    // path.join(outputDir, 'src', 'index.html'), // TODO re-enable this for template export
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
      // Remove other variable definitions
      .then(contents => contents.replace(
        /const [A-Z_]+ = '.*';/g,
        '',
      ))
      // Replace page title
      .then(contents => contents.replace(/<title>(.*)<\/title>/, `<title>${settings.title}</title>`))
      // Write updated config file
      .then(updatedContents => fse.writeFile(configPath, updatedContents))),
  ).then(() => args);
};

export default configureTemplateSettings;
