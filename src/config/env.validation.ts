import * as Joi from 'joi';

const ADMIN_PASSWORD_MIN_LENGTH: number = 8;
const ADMIN_SECRET_MIN_LENGTH: number = 16;
const PAYMENT_LOGIN_MIN_LENGTH: number = 3;
const PAYMENT_PASSWORD_MIN_LENGTH: number = 8;

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  APP_URL: Joi.string().uri().optional(),
  DATABASE_URL: Joi.alternatives().conditional('NODE_ENV', {
    is: 'test',
    then: Joi.string().uri().optional(),
    otherwise: Joi.string().uri().required(),
  }),
  OTP_PEPPER: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(8).required(),
    otherwise: Joi.string().min(8).optional(),
  }),
  JWT_SECRET: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(32).required(),
    otherwise: Joi.string().min(32).optional(),
  }),
  JWT_REFRESH_SECRET: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(32).required(),
    otherwise: Joi.string().min(32).optional(),
  }),
  ADMIN_EMAIL: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().email().required(),
    otherwise: Joi.string().email().optional(),
  }),
  ADMIN_PASSWORD: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(ADMIN_PASSWORD_MIN_LENGTH).required(),
    otherwise: Joi.string().min(ADMIN_PASSWORD_MIN_LENGTH).optional(),
  }),
  ADMIN_COOKIE_SECRET: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(ADMIN_SECRET_MIN_LENGTH).required(),
    otherwise: Joi.string().min(ADMIN_SECRET_MIN_LENGTH).optional(),
  }),
  ADMIN_SESSION_SECRET: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(ADMIN_SECRET_MIN_LENGTH).required(),
    otherwise: Joi.string().min(ADMIN_SECRET_MIN_LENGTH).optional(),
  }),
  ADMIN_ROOT_PATH: Joi.string()
    .pattern(/^\/[A-Za-z0-9/_-]*$/)
    .default('/admin'),
  PAYMENT_URL: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().uri().required(),
    otherwise: Joi.string().uri().optional(),
  }),
  PAYMENT_REDIRECT_URL_USER: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().uri().required(),
    otherwise: Joi.string().uri().optional(),
  }),
  PAYMENT_REDIRECT_URL: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().uri().required(),
    otherwise: Joi.string().uri().optional(),
  }),
  PAYMENT_LOGIN: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(PAYMENT_LOGIN_MIN_LENGTH).required(),
    otherwise: Joi.string().min(PAYMENT_LOGIN_MIN_LENGTH).optional(),
  }),
  PAYMENT_PASSWORD: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(PAYMENT_PASSWORD_MIN_LENGTH).required(),
    otherwise: Joi.string().min(PAYMENT_PASSWORD_MIN_LENGTH).optional(),
  }),
  TELEGRAM_BOT_TOKEN: Joi.alternatives().conditional('NODE_ENV', {
    is: 'production',
    then: Joi.string()
      .pattern(/^\d+:[A-Za-z0-9_-]+$/)
      .required(),
    otherwise: Joi.string()
      .pattern(/^\d+:[A-Za-z0-9_-]+$/)
      .optional(),
  }),
  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().optional().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().optional(),
  AWS_S3_PUBLIC_URL: Joi.string().optional(),
  AWS_S3_ENDPOINT: Joi.string().optional(),
  // Firebase Configuration
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  // SMS.RU Configuration
  SMS_RU_API_ID: Joi.string().required(),
});
