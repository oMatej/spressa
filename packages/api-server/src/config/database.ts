const TYPE: string = process.env.TYPEORM_CONNECTION || 'mysql';
const TYPEORM_HOST: string = process.env.TYPEORM_HOST;
const TYPEORM_PORT: number = parseInt(process.env.TYPEORM_PORT, 10);
const TYPEORM_USERNAME: string = process.env.TYPEORM_USERNAME;
const TYPEORM_PASSWORD: string = process.env.TYPEORM_PASSWORD;
const TYPEORM_DATABASE: string = process.env.TYPEORM_DATABASE;
const TYPEORM_LOGGING: boolean = process.env.TYPEORM_LOGGING === 'true';
const TYPEORM_SYNCHRONIZE: boolean = process.env.TYPEORM_SYNCHRONIZE === 'true';
const TYPEORM_ENTITIES: string[] = process.env.TYPEORM_ENTITIES ? process.env.TYPEORM_ENTITIES.split(',') : [];

const TYPEORM_MIGRATIONS: string[] = process.env.TYPEORM_MIGRATIONS ? process.env.TYPEORM_MIGRATIONS.split(',') : [];
const TYPEORM_MIGRATIONS_RUN: boolean = process.env.TYPEORM_MIGRATIONS_RUN === 'true';
const TYPEORM_MIGRATIONS_DIR: string = process.env.TYPEORM_MIGRATIONS_DIR;

export default {
  type: TYPE,
  host: TYPEORM_HOST,
  port: TYPEORM_PORT,
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  logging: TYPEORM_LOGGING,
  synchronize: TYPEORM_SYNCHRONIZE,
};
