const db = require('./lib/db');

const name = process.argv[2];
if (!name) {
  console.error('No name');
  process.exit(1);
}

db.setup().then((conn) => {
}).catch(console.error.bind(console));
