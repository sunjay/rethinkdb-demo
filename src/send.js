const chalk = require('chalk');
const prompt = require('prompt');

const db = require('./lib/db');

const name = process.argv[2];
if (!name) {
  console.error('No name');
  process.exit();
}

prompt.message = '';
prompt.delimeter = '';
prompt.start();

db.setup().then((conn) => {
  console.log('Connected as', name, '\n');
  printHelp();

  loop(conn);
});

function scheduleLoop(conn) {
  setImmediate(loop.bind(null, conn));
}

function loop(conn) {
  promptMessage().then((message) => {
    if (!message) {
      return;
    }

    if (message.startsWith('/')) {
      return handleCommand(conn, message);
    }

    return sendMessage(conn, message);
  }).then(() => scheduleLoop(conn)).catch((error) => {
    console.error(error);
    scheduleLoop(conn);
  });
}

function sendMessage(conn, message) {
  return db.send(conn, name, message).then(() => {
    console.log('OK');
  });
}

function handleCommand(conn, command) {
  const [commandName, ...args] = command.slice(1).split(/\s+/);
  const handler = {
    award: awardBadge,
    help: printHelp,
    badges: countBadges,
    spam: spam,
  }[commandName];

  if (!handler) {
    console.error(`Unrecognized command: ${commandName}`);
    return;
  }

  return handler(conn, args);
}

function awardBadge(conn, [username, badge, ...extra]) {
  if (extra && extra.length) {
    console.error('too many arguments');
    return;
  }
  if (!username) {
    console.error('no username specified');
    return;
  }
  if (!badge) {
    console.error('no badge specified');
    return;
  }
  return db.award(conn, username, badge);
}

function countBadges(conn, args) {
  if (args && args.length) {
    console.error('too many arguments');
    return;
  }

  return db.badgeFrequencies(conn).then((cursor) => {
    return cursor.toArray().then((freq) => {
      printBadges(freq);
    });
  });
}

function printHelp() {
  console.log('/help - print this help');
  console.log('/award [username] [badge] - award a badge to a user');
  console.log('/badges - return how many of each badge has been awarded')
  return Promise.resolve();
}

function printBadges(badgeCounts) {
  let output = '';
  for (let {group, reduction} of badgeCounts) {
    output += chalk.yellow(group);
    output += ': ';
    output += reduction;
    output += ' ';
  }

  console.log(output.trim());
}

function spam(conn, arg, i = 0) {
  return sendMessage(conn, 'spam' + i).then(() => {
    return spam(conn, arg, i + 1);
  });
}

function promptMessage() {
  return new Promise((resolve, reject) => {
    prompt.get({
      properties: {
        message: {
          description: chalk.blue('>'),
        },
      },
    }, (err, {message = null}) => {

      if (err) {
        console.error('Error:', err.toString());
      }

      if (message) {
        message = message.trim();
      }

      resolve(message);
    });
  });
}
