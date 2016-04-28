'use strict';

const r = require('rethinkdb');

const DB = 'chat';

module.exports = {
  messagesFeed,
  badgesFeed,
  setup,
  send,
  award,
};

// Creates a change feed that returns each new message
// Initially returns all messages
function messagesFeed(conn) {
  return r.db('chat').table('messages')
  	.changes({includeInitial: true})('new_val')
    .eqJoin('user_id', r.db('chat').table('users'))
    .pluck({left: true, right: {name: true}})
    .zip()
    .run(conn);
}

// Creates a change feed that returns each new badge
// Initially returns all badges
function badgesFeed(conn) {
  return r.db('chat').table('users')
    .changes()
    .run(conn);
}

// Sends a message from the given user to the given user
function send(conn, sender, message) {
  return getUser(conn, sender).then((user) => {
    return r.db(DB).table('messages').insert([
      {
        user_id: user.id,
        created: new Date(),
        message: message,
      }
    ]).run(conn);
  });
}

// Awards a badge to the given user
function award(conn, name, badge) {
  return getUser(conn, name).then((user) => {
    return r.db(DB).table('users')
      .get(user.id).update({
        badges: r.row('badges').append(badge)
      }).run(conn);
  });
}

// Gets or creates a user
function getUser(conn, name) {
  const filtered = r.db(DB).table('users').filter(r.row('name').eq(name)).limit(1);
  return filtered.run(conn).then((cursor) => {
    return cursor.next().then((row) => {
      return row;
    }).catch((err) => {
      console.log('Creating new user', name);
      return createUser(conn, name);
    });
  });
}

// Creates a user
function createUser(conn, name) {
  return r.db(DB).table('users').insert([
    {
      name: name,
      created: new Date(),
      badges: [],
    }
  ]).run(conn).then(() => {
    return getUser(conn, name);
  });
}

// Setups up the basic database and tables
function setup() {
  return connect().then((conn) => {
    return new Promise((resolve, reject) => {
      r.dbCreate(DB).run(conn, (err, result) => {
        if (!err) {
          console.log('chat database created');
        }
        const tables = ['messages', 'users'];
        Promise.all(tables.map(createTable.bind(null, conn))).then(() => {
          resolve(conn);
        }).catch(reject);
      });
    });
  });
}

// Creates a table or does nothing if that table already exists
function createTable(conn, tableName) {
  return new Promise((resolve, reject) => {
    r.db(DB).tableCreate(tableName, {primaryKey: 'id'}).run(conn, (err) => {
      if (!err) {
        console.log('created table', tableName);
      }
      resolve();
    });
  });
}

// Connects to RethinkDB
function connect() {
  return new Promise((resolve, reject) => {
    r.connect({host: 'localhost', port: 28015}, (err, conn) => {
      if (err) {
        console.error('Unable to connect');
        return reject(err);
      }
      resolve(conn);
    });
  });
}
