const TYPE: string = 'mysql';
const HOST: string = process.env.DATABASE_HOST;
const PORT: number = parseInt(process.env.DATABASE_PORT, 10);
const USER: string = process.env.DATABASE_USER;
const PASSWORD: string = process.env.DATABASE_PASSWORD;
const DATABASE_NAME: string = process.env.DATABASE_NAME;
const LOGGING: boolean = process.env.DATABASE_LOGS === 'true';
const RUN_MIGRATIONS: boolean = process.env.DATABASE_RUN_MIGRATIONS === 'true';
const SYNC: boolean = process.env.DATABASE_SYNC === 'true';

export const oauth = {
  type: TYPE,
  host: HOST,
  port: PORT,
  username: USER,
  password: PASSWORD,
  database: DATABASE_NAME,
  logging: LOGGING,
  synchronize: SYNC,
};
