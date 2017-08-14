// load modules
import Sequelize from 'sequelize'
import Joi from 'joi'
import Schema from './schema'
import DB from './DB'

const pkg = {
  name: 'db',
  version: '0.0.0'
}

const internals = {}

internals.configure = opts => {
  let connection = opts.connection

  if (typeof opts.connection === 'string') {
    opts.sequelize = new Sequelize(opts.connection)
  }
  
  if (typeof opts.connection === 'object') {
    const {user, password, dbname, uri} = opts.connection
    if (user && password && dbname) {
      opts.sequelize = new Sequelize(dbname, user, password, opts.connection)
    }
    if (uri) {
      opts.sequelize = new Sequelize(uri, opts.connection)
    }
  }
  return opts.sequelize.authenticate()
    .then(() => {
      if (opts.dropAllTables) {
        return opts.sequelize.getQueryInterface().dropAllTables({
          force: true
        })
      }
      return
    })
    .then(() => {
      return new DB(opts)
    })
    .then(database => {
      return database.loadModels(opts.paths).then(() => database)
    })
    then(database => {
      if (opts.onConnect) {
        let maybePromise = opts.onConnect(opts.sequelize)
        if (maybePromise && typeof maybePromise.then === 'function') {
          return maybePromise.then(() => database)
        }
        return database
      }
      return database
    })
}

export function register (server, options, next) {
  if (!options) throw new Error('Missing db plugin options')
  if (!Array.isArray(options)) options = [options]
  
  const validation = Joi.validate(options, Schema.options)
  if (!validation || validation.error) throw validation.error

  const getDb = (request) => {
    return function getDb(name) {
      if (!name || !request.server.plugins[pkg.name].hasOwnProperty(name)) {
        const key = Object.keys(request.server.plugins[pkg.name]).shift()
        return request.server.plugins[pkg.name][key]
      }
      return request.server.plugins[pkg.name][name]
    }
  }

  const getServerDb = function getDb(name) {
    if (!name || !server.plugins[pkg.name].hasOwnProperty(name)) {
      const key = Object.keys(server.plugins[pkg.name]).shift()
      return server.plugins[pkg.name][key]
    }
    return server.plugins[pkg.name][name]
  }

  server.decorate('request', 'getDb', getDb, {apply: true})
  server.decorate('server', 'getDb', getServerDb)

  const configured = options.reduce((acc, opts) => {
    return [].concat(acc, [
      internals.configure(opts)
        .then((db) => {
          server.expose(opts.name, db)
          return Promise.resolve(db)
        })
    ])
  }, [])

  Promise.all(configured)
    .then((dbs) => {
      if(!server.plugins[pkg.name].hasOwnProperty('default')) {
        server.expose('default', dbs[0])
      }
      return next()
    })
    .catch((err) => {
      return next(err)
    })
}

register.attributes = pkg

export default register