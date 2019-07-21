export const TESTING = process.env.MAIL_TESTING === 'true';
const HOST = process.env.MAIL_HOST;
const PORT = parseInt(process.env.MAIL_PORT, 10);
const USERNAME = process.env.MAIL_USER;
const PASSWORD = process.env.MAIL_PASS;

const FROM = '';

export const transport = {
  host: HOST,
  port: PORT,
  auth: {
    user: USERNAME,
    pass: PASSWORD,
  },
};

export const defaults = {
  from: FROM,
};
