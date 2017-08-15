'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; // load modules


exports.register = register;

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _DB = require('./DB');

var _DB2 = _interopRequireDefault(_DB);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pkg = {
  name: 'db',
  version: '0.0.0'
};

var internals = {};

internals.configure = function (opts) {
  var connection = opts.connection;

  if (typeof opts.connection === 'string') {
    opts.sequelize = new _sequelize2.default(opts.connection);
  }

  if (_typeof(opts.connection) === 'object') {
    var _opts$connection = opts.connection,
        user = _opts$connection.user,
        password = _opts$connection.password,
        dbname = _opts$connection.dbname,
        uri = _opts$connection.uri;

    if (user && password && dbname) {
      opts.sequelize = new _sequelize2.default(dbname, user, password, opts.connection);
    }
    if (uri) {
      opts.sequelize = new _sequelize2.default(uri, opts.connection);
    }
  }
  return opts.sequelize.authenticate().then(function () {
    if (opts.dropAllTables) {
      return opts.sequelize.getQueryInterface().dropAllTables({
        force: true
      });
    }
    return;
  }).then(function () {
    return new _DB2.default(opts);
  }).then(function (database) {
    return database.loadModels(opts.paths).then(function () {
      return database;
    });
  });
  then(function (database) {
    if (opts.onConnect) {
      var maybePromise = opts.onConnect(opts.sequelize);
      if (maybePromise && typeof maybePromise.then === 'function') {
        return maybePromise.then(function () {
          return database;
        });
      }
      return database;
    }
    return database;
  });
};

function register(server, options, next) {
  if (!options) throw new Error('Missing db plugin options');
  if (!Array.isArray(options)) options = [options];

  var validation = _joi2.default.validate(options, _schema2.default.options);
  if (!validation || validation.error) throw validation.error;

  var getDb = function getDb(request) {
    return function getDb(name) {
      if (!name || !request.server.plugins[pkg.name].hasOwnProperty(name)) {
        var key = Object.keys(request.server.plugins[pkg.name]).shift();
        return request.server.plugins[pkg.name][key];
      }
      return request.server.plugins[pkg.name][name];
    };
  };

  var getServerDb = function getDb(name) {
    if (!name || !server.plugins[pkg.name].hasOwnProperty(name)) {
      var key = Object.keys(server.plugins[pkg.name]).shift();
      return server.plugins[pkg.name][key];
    }
    return server.plugins[pkg.name][name];
  };

  server.decorate('request', 'getDb', getDb, { apply: true });
  server.decorate('server', 'getDb', getServerDb);

  var configured = options.reduce(function (acc, opts) {
    return [].concat(acc, [internals.configure(opts).then(function (db) {
      server.expose(opts.name, db);
      return Promise.resolve(db);
    })]);
  }, []);

  server.event('database.synced');

  server.ext({
    type: 'onPreStart',
    method: function method(server, next) {
      var promises = [];
      for (var key in server.plugins[pkg.name]) {
        promises.push(server.plugins[pkg.name][key].sync());
      }

      Promise.all(promises).then(function () {
        server.emit('database.synced');
        next();
      });
    }
  });

  Promise.all(configured).then(function (dbs) {
    if (!server.plugins[pkg.name].hasOwnProperty('default')) {
      server.expose('default', dbs[0]);
    }
    return next();
  }).catch(function (err) {
    return next(err);
  });
}

register.attributes = pkg;

exports.default = register;