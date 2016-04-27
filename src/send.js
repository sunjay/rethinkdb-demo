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
  console.log('Connected as', name);

  loop(conn);
});

function loop(conn) {
  promptMessage().then((message) => {
    if (!message) {
      setImmediate(loop.bind(null, conn));
      return;
    }

    db.send(conn, name, message).then(() => {
      setImmediate(loop.bind(null, conn));
    }).then(() => {
      console.log('OK');
    }).catch((err) => {
      console.error(err);
    });
  })
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
