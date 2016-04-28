const db = require('./lib/db');

const prompt = require('prompt');

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

    return db.send(conn, name, message).then(() => {
      console.log('OK');
    });
  }).then(() => scheduleLoop(conn)).catch((error) => {
    console.error(error);
    scheduleLoop(conn);
  });
}

function handleCommand(conn, command) {
  const [commandName, ...args] = command.slice(1).split(/\s+/);
  const handler = {
    award: awardBadge,
    help: printHelp,
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

function printHelp() {
  console.log('/help - print this help');
  console.log('/award [username] [badge] - award a badge to a user');
  return Promise.resolve();
}

function promptMessage() {
  return new Promise((resolve, reject) => {
    prompt.get({
      properties: {
        message: {
          description: '>',
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
