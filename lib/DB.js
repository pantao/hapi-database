'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DB = function () {
  function DB(options) {
    _classCallCheck(this, DB);

    this._options = options;

    this.sequelize = options.sequelize;
    this.paths = options.paths;
    this.models = {};
    this._inited = false;
  }

  _createClass(DB, [{
    key: 'getModel',
    value: function getModel(name) {
      return this.models.hasOwnProperty(name) ? this.models[name] : null;
    }
  }, {
    key: 'getModels',
    value: function getModels() {
      return this.models;
    }

    // 加载模型

  }, {
    key: 'loadModels',
    value: function loadModels(paths) {

      // 获取所有模型文件
      var files = _models2.default.getFiles(paths);
      // 加载所有模型
      var models = _models2.default.load(files, this.sequelize.import.bind(this.sequelize));

      var promises = [new Promise(function (resolve, reject) {
        resolve(models);
      })];
      for (var name in models) {
        if (this.models.hasOwnProperty(name)) {
          throw new Error('Model ' + name + ' redefined.');
        }
        this.models[name] = models[name];
      }

      _models2.default.applyRelations(this.models);

      for (var _name in models) {
        if (this._options.sync) {
          promises.push(this.models[_name].sync({
            force: this._options.forceSync
          }));
        }
      }

      this.paths.concat(paths);

      this._inited = true;
      return Promise.all(promises);
    }
  }]);

  return DB;
}();

exports.default = DB;