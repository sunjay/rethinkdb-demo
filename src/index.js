'use strict';

const fs = require('fs');
const path = require('path');

const r = require('rethinkdb');

const EXAMPLES_DIR = path.join(__dirname, 'examples');

r.connect({host: 'localhost', port: 28015}, (err, conn) => {
  if (err) throw err;

  const examples = fs.readdirSync(EXAMPLES_DIR).map((name) => path.join(EXAMPLES_DIR, name));

  const selectedExamples = process.argv.slice(2).map((x) => x.replace(/'/g, ''));

  let selected = examples;
  if (selectedExamples && selectedExamples.length) {
    const selectedFiles = selectedExamples.reduce((files, ex) => {
      const file = examples.find((name) => path.basename(name).startsWith(ex));
      if (!file) {
        console.error('Could not find:', ex);
        return files;
      }
      return [...files, file];
    }, []);
    if (selectedFiles && selectedFiles) {
      selected = selectedFiles;
    }
  }

  runExamples(conn, selected);
  process.exit();
});

function runExamples(conn, filenames) {
  filenames.forEach((filename) => {
    const name = path.basename(filename);
    console.info('\nRunning:', name);
    try {
      const runner = require(filename);
      runner(conn);
      console.info('Success:', name);
    }
    catch (e) {
      console.error(e);
      console.info('Failed:', name);
    }
  });
}
