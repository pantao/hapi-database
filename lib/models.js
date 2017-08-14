'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getFiles = getFiles;
exports.load = load;
exports.applyRelations = applyRelations;
exports.applyScopes = applyScopes;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFiles(paths, ignored) {
  var opts = {
    nodir: true,
    dot: false
  };

  if (!Array.isArray(paths)) paths = [paths];
  if (ignored) opts.ignore = ignored;

  return paths.reduce(function (acc, pattern) {
    var joinPaths = Array.prototype.concat.bind([], acc);
    try {
      var _paths = _glob2.default.sync(pattern, opts);
      return joinPaths(_paths);
    } catch (e) {
      console.error(e);
      return joinPaths([]);
    }
  }, []);
}

function load(files, fn) {
  if (!files || !files.length) {
    return {};
    // throw new Error('No model files were found')
  }
  if (files && !Array.isArray(files)) files = [files];
  return files.reduce(function (acc, file) {
    var models = {};
    var filepath = _path2.default.isAbsolute(file) ? file : _path2.default.join(process.cwd(), file);
    try {
      var Model = fn(filepath);
      models[Model.name] = Model;
    } catch (e) {
      console.error(e);
    }
    return Object.assign({}, acc, models);
  }, {});
}

function applyRelations(models) {
  if (!models || (typeof models === 'undefined' ? 'undefined' : _typeof(models)) !== 'object') throw new Error('Can\'t apply relationships on invalid models object');

  Object.keys(models).forEach(function (name) {
    if (models[name].hasOwnProperty('associate') && !models[name]._associated) {
      models[name].associate(models);
      models[name]._associated = true;
    }
  });

  return models;
}

function applyScopes(models) {
  if (!models || (typeof models === 'undefined' ? 'undefined' : _typeof(models)) !== 'object') throw new Error('Can\'t add scopes on invalid models object');

  Object.keys(models).forEach(function (name) {
    if (models[name].hasOwnProperty('scope')) {
      models[name].scope(models);
    }
  });

  return models;
}

exports.default = {
  getFiles: getFiles,
  load: load,
  applyRelations: applyRelations,
  applyScopes: applyScopes
};