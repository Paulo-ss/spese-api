import * as Joi from 'joi';

export const validationSchema = Joi.object({
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
});
