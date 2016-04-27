'use strict';

const r = require('rethinkdb');

const DB = 'chat';

module.exports = {
  setup,
};

function setup() {
  return connect().then((conn) => {
    r.dbCreate(DB).run(conn, (err, result) => {
      if (!err) {
        console.log('chat database created');
      }
      const tables = ['message', 'user'];
      return Promise.all(tables.map(createTable.bind(null, conn)));
    });
  });
};

function createTable(conn, tableName) {
  return new Promise((resolve, reject) => {
    r.db(DB).tableCreate(tableName, {primaryKey: 'id'}).run(conn, (err) => {
      if (!err) {
        console.log('created table', tableName);
        resolve();
      }
    });
  });
}

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
};
