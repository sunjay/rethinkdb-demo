const chalk = require('chalk');

const db = require('./lib/db');

db.setup().then((conn) => {
  db.messagesFeed(conn).then((cursor) => {
    cursor.eachAsync(logMessage);
  }).catch(console.error);

  db.badgesFeed(conn).then((cursor) => {
    cursor.eachAsync(({old_val, new_val}) => {
      old_val = old_val || {changes: []};
      const awarded = difference(new_val.badges, old_val.badges);
      for (let badge of awarded) {
        logBadge(new_val.name, badge);
      }
    }).catch(console.error);
  });
}).catch(console.error);

function logBadge(name, badge) {
  let output = '';
  output += chalk.yellow('[award] ');
  output += chalk.green(name);
  output += ' was awarded ';
  output += chalk.blue(badge);

  console.log(output);
}

function logMessage({created, message, name}) {
  const time = `${created.getHours()}:${created.getMinutes()}:${created.getSeconds()}`;

  let output = '';
  output += chalk.blue(`[${time}]`);
  output += chalk.green(`[${name}] `);
  output += message;
  console.log(output);
}

// Returns every item in a that is not in b
function difference(a, b) {
  b = new Set(b);
  return a.filter((x) => !b.has(x));
}
