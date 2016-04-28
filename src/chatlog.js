const chalk = require('chalk');

const db = require('./lib/db');

db.setup().then((conn) => {
  db.messagesFeed(conn).then((cursor) => {
    cursor.eachAsync(logMessage);
  });
});

function logMessage({created, message, name}) {
  const time = `${created.getHours()}:${created.getMinutes()}:${created.getSeconds()}`;

  let output = '';
  output += chalk.blue(`[${time}]`);
  output += chalk.green(`[${name}] `);
  output += message;
  console.log(output);
}
