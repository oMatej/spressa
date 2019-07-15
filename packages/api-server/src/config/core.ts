export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production';

export const APP_SECRET_KEY: string = process.env.APP_SECRET_KEY || '__SECURE_APP_SECRET_KEY__';

export const SERVICE_NAME: string = process.env.SERVICE_NAME;
export const SERVICE_URL: string = process.env.SERVICE_URL;
