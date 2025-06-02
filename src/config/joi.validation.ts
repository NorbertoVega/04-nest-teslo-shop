import * as Joi from 'joi';

export const JoiValidationScheema = Joi.object({
    DB_PASSWORD: Joi.required(),
    DB_NAME: Joi.required(),
    DB_HOST: Joi.required(),
    DB_PORT: Joi.required(),
    DB_USERNAME: Joi.required(),
    HOST_API: Joi.required(),
    PORT: Joi.number().default(3005),
    JWT_SECRET: Joi.required()
});