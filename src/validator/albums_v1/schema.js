const Joi = require('joi');

const Album_v1_PayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

const Cover_v3_Schema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required()
}).unknown();

module.exports = { Album_v1_PayloadSchema,Cover_v3_Schema };