const path = require('path');
const fs = require('fs');
const licenseChecker = require('license-checker');

const sanitize = (s) => s.replace('<', '&lt;').replace('>', '&gt;');

// Get information for all production dependencies, starting at electron-app because it imports
// all the other packages.
const getCreditInfo = () => new Promise((resolve, reject) => {
    licenseChecker.init({
    start: path.join(__dirname, '..'),
    production: true,
  }, (err, result) => {
    if (err) reject(err);
    resolve(result);
  });
});

const formatCredits = ({ name, licenses, publisher, licenseText }) => {
  const frags = [
    '<li tabindex="1">',
    `<h2>${sanitize(name)}</h2>`,
  ];
  frags.push('<pre>');
  if (licenseText) {
    frags.push(sanitize(licenseText));
  } else {
    if (licenses) frags.push(`License: ${sanitize(licenses)}`);
    if (publisher) frags.push(`Published by: ${sanitize(publisher)}`);
  }
  frags.push('</pre>');
  frags.push('</li>');

  return frags.join('\n');
};

// update the list of credits used in the frontend.
const writeCreditsFile = (info) => {
  const credits = Object.entries(info).map(([name, { licenses, publisher, licenseFile }]) => {
    let licenseText;
    if (licenseFile && !/readme/i.test(licenseFile) && fs.existsSync(licenseFile)) {
      licenseText = fs.readFileSync(licenseFile, 'utf8').toString();
    }

    if (!licenseText && !licenses) {
      console.log(`${name} (${licenses}): ${licenseFile}`);
    }

    return formatCredits({ name, licenses, publisher, licenseText });
  }).join('\n');

  const creditsPage = `<DOCTYPE html>
  <html>
  <head>
    <style type="text/css">
      body { font-family: sans-serif; }
      ul { list-style: none; padding: 0; }
      pre { display: none; white-space: break-spaces; }
      li:focus pre { display: block; }
      h2 { cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>Credits</h1>
    <p>This is a list of open-source components used to create this software.</p>
    <ul>
      ${credits}
    </ul>
  </body>
  </html>`;

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, '..', 'credits.html'), creditsPage, (err) => {
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
