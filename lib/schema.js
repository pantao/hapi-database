'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var option = _joi2.default.object().keys({
  name: _joi2.default.string().token().required(),
  paths: _joi2.default.alternatives().try(_joi2.default.string(), _joi2.default.array().items(_joi2.default.string())),
  connection: _joi2.default.object().required(),
  sync: _joi2.default.boolean().default(false),
  forceSync: _joi2.default.boolean().default(false),
  debug: _joi2.default.boolean(),
  onConnect: _joi2.default.func().arity(1)
});

var options = _joi2.default.alternatives().try(_joi2.default.array().items(option), option);

exports.default = {
  option: option,
  options: options
};