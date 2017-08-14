'use strict';

// Load modules
const Lab = require('lab');
const Code = require('code');
const Sinon = require('sinon');
const Hapi = require('hapi');
const Sequelize = require('sequelize');

// Module globals
const internals = {};

// Test shortcuts
const lab = exports.lab = Lab.script();
const test = lab.test;
const expect = Code.expect;

lab.suite('hapi-database', () => {

  test('plugin works', { parallel: true }, (done) => {

    const server = new Hapi.Server();
    server.connection();

    const onConnect = function (database) {
      server.log('onConnect called');
    }

    const spy = Sinon.spy(onConnect);

    server.register([
      {
        register: require('../lib'),
        options: [
          {
            name: 'shop',
            connection: {
              uri: 'mysql://root:root@127.0.0.1:3306/hapi_database'
            },
            paths: ['./test/models/**/*.js'],
            sync: true,
            forceSync: true,
            onConnect: spy
          }
        ]
      }
    ], (err) => {
      expect(err).to.not.exist();
      expect(server.plugins['hapi-database']['shop'].sequelize).to.be.an.instanceOf(Sequelize);
      expect(spy.getCall(0).args[0]).to.be.an.instanceOf(Sequelize);
      server.plugins['hapi-database']['shop'].sequelize.query('show tables', { type: Sequelize.QueryTypes.SELECT }).then((tables) => {
        expect(tables.length).to.equal(6);
        done();
      });
    })
  });

  test('plugin throws error when no models are found', { parallel: true }, (done) => {

    const server = new Hapi.Server();
    server.connection();

    server.register([
      {
        register: require('../lib'),
        options: [
          {
            name: 'foo',
            connection: {
              uri: 'mysql://root:root@127.0.0.1:3306/hapi_database'
            },
            paths: ['./foo/**/*.js'],
            sync: true,
            forceSync: true
          }
        ]
      }
    ], (err) => {
      expect(err).to.exist();
      done();
    })
  });
});
