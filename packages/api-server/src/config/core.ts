export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production';

export const APP_SECRET_KEY: string = process.env.APP_SECRET_KEY || '__SECURE_APP_SECRET_KEY__';
export const COOKIE_TOKEN_KEY = '__opt_user__';
export const JWT_ACCESS_TOKEN_LIFETIME = 3600;
export const JWT_REFRESH_TOKEN_LIFETIME = 1209600000;

export const SERVICE_NAME: string = process.env.SERVICE_NAME;
export const SERVICE_URL: string = process.env.SERVICE_URL;
