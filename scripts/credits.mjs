import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as licenseChecker from 'license-checker-rseidelsohn';

const sanitize = s => s.replace('<', '&lt;').replace('>', '&gt;');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get information for all production dependencies, starting at electron-app because it imports
// all the other packages.
const getCreditInfo = () => new Promise((resolve, reject) => {
  licenseChecker.init({
    start: path.resolve(__dirname, '..'),
    production: true,
  }, (err, result) => {
    if (err) reject(err);
    resolve(result);
  });
});

const formatCredits = ({ name, repository, licenses, publisher, licenseText }) => {
  const frags = [
    '<li tabindex="1">',
    `<h2>${sanitize(name)}</h2>`,
  ];
  frags.push('<pre>');
  if (repository) {
    frags.push(`Website: ${sanitize(repository)}\n\n`);
  }
  if (licenseText) {
    frags.push(sanitize(licenseText));
  } else {
    if (licenses && !/^Custom/.test(licenses)) frags.push(`License: ${sanitize(licenses)}`);
    if (publisher) frags.push(`Published by: ${sanitize(publisher)}`);
  }
  frags.push('</pre>');
  frags.push('</li>');

  return frags.join('\n');
};

// update the list of credits used in the frontend.
const writeCreditsFile = (info) => {
  const hiddenDepPrefixes = [
    '@bbc/bbcat-orchestration',
    '@bbc/audio-orchestrator',
  ];
  const credits = Object.entries(info)
    .filter(([name]) => !hiddenDepPrefixes.some(s => name.startsWith(s)))
    .map(([name, { repository, licenses, publisher, licenseFile }]) => {
      let licenseText;
      if (licenseFile && !/readme/i.test(licenseFile) && fs.existsSync(licenseFile)) {
        licenseText = fs.readFileSync(licenseFile, 'utf8').toString();
      }

      if (!licenseText && !licenses) {
        console.warn(`${name} (${licenses}): ${licenseFile}`);
      }

      return formatCredits({
        name, repository, licenses, publisher, licenseText,
      });
    }).join('\n');

  const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.join('..', 'package.json')), 'utf-8'));

  const creditsPage = `<DOCTYPE html>
  <html>
  <head>
    <title>Audio Orchestrator</title>
    <style type="text/css">
      body { font-family: sans-serif; }
      ul { list-style: none; padding: 0; }
      li pre { display: none; white-space: break-spaces; }
      li:focus pre { display: block; }
      h2 { cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>About Audio Orchestrator</h1>
    <p><b>Version ${version}</b></p>
    <p><b>Copyright BBC R&amp;D, 2025</b></p>
    <p>https://www.bbc.co.uk/opensource/projects/project/audio-orchestrator</p>
    <p>https://github.com/bbc/audio-orchestrator</p>
    <h2>Licence information</h2>
    <p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.</p>
    <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.</p>
    <p>You should have received a copy of the GNU General Public License along with this program. If not, see: https://www.gnu.org/licenses/.</p>

    <h2>Acknowledgements</h2>
    <p>Audio Orchestrator was developed at BBC R&amp;D by Kristian Hentschel, with contributions from Jon Francombe, Danial Haddadi, Emma Young, and Sonal Tandon.
    <p>The Audio Orchestrator icon is derived from a photo by Spencer Imbrock on Unsplash.</p>
    <p>Below is a list of open-source components used to create this software. Click on the package name to see licence information.</p>
    <ul>
      ${credits}
    </ul>
  </body>
  </html>`;

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, '../electron-app', 'credits.html'), creditsPage, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Run the code and print summary or error
getCreditInfo()
  .then((info) => {
    console.log(`Got license information for ${Object.keys(info).length} dependencies.`);
    return writeCreditsFile(info);
  })
  .catch((err) => {
    console.error(`Failed to update dependency credits: ${err}`);
    process.exit(1);
  });
