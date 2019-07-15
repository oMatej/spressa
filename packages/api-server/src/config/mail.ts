export const HOST = 'smtp.ethereal.email';
export const PORT = 587;
export const USERNAME = 'ronny77@ethereal.email';
export const PASSWORD = 'nKRxhm6d8CYXURE89x';

export const FROM = '';

export const test = {
  transport: {
    host: HOST,
    port: PORT,
    auth: {
      user: USERNAME,
      pass: PASSWORD,
    },
  },
};

export const defaults = {
  from: FROM,
};
