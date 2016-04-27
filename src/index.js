'use strict';

const fs = require('fs');
const path = require('path');

const r = require('rethinkdb');

const EXAMPLES_DIR = path.join(__dirname, 'examples');

r.connect({host: 'localhost', port: 28015}, (err, conn) => {
  if (err) throw err;

  const examples = fs.readdirSync(EXAMPLES_DIR).map((name) => path.join(EXAMPLES_DIR, name));

  const selectedExample = (process.argv[2] || '').replace(/'/g, '');

  let selected = examples;
  if (selectedExample) {
    const selectedFile = examples.find((name) => path.basename(name).startsWith(selectedExample));
    if (selectedFile) {
      selected = [selectedFile];
    }
    else {
      console.error('Could not find:', selectedExample);
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
