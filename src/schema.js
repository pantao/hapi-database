import Joi from 'joi'

const option = Joi.object().keys({
  name: Joi.string().token().required(),
  paths: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  connection: Joi.object().required(),
  sync: Joi.boolean().default(false),
  forceSync: Joi.boolean().default(false),
  debug: Joi.boolean(),
  onConnect: Joi.func().arity(1)
});

const options = Joi.alternatives().try(Joi.array().items(option), option);

export default {
  option,
  options
}