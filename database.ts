import { Umzug, SequelizeStorage } from "umzug";
import { Dialect, Sequelize } from "sequelize";

const SQL_DB_USER = process.env.SQL_DB_USER || "postgres";
const SQL_DB_PWD = process.env.SQL_DB_PWD || "root";
const SQL_DIALECT = (process.env.SQL_DIALECT ||
  "postgres") as unknown as Dialect;
export const sequelize = new Sequelize(
  process.env.SQL_DB_NAME!,
  SQL_DB_USER,
  SQL_DB_PWD,
  {
    host: "localhost",
    dialect: SQL_DIALECT,
    logging: true,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 90000,
    },
  }
);

export async function connectToDB() {
  try {
    await sequelize.authenticate();
    console.log(
      "Postgress SQL Reader Connection has been established successfully."
    );

    // Creating tables in database using migration scripts
    // eslint-disable-next-line no-use-before-define
    await runAllMigrations();
    return sequelize;
  } catch (err) {
    console.log("Unable to connect to the database:", err);
    throw err;
  }
}

export async function disconnectFromDB() {
  await sequelize.close();
  console.log("Disconnected from database");
}

export async function runAllMigrations() {
  const migrator = new Umzug({
    migrations: {
      glob: ["migrations/*.js", { cwd: __dirname }],
    },
    context: sequelize,
    storage: new SequelizeStorage({
      sequelize,
    }),
    logger: undefined,
  });

  const seeder = new Umzug({
    migrations: {
      glob: ["seeders/*.js", { cwd: __dirname }],
    },
    context: sequelize,
    storage: new SequelizeStorage({
      sequelize,
    }),
    logger: console,
  });
  // checks migrations and run them if they are not already applied
  await migrator.up();
  console.log("All migrations performed successfully");
  await seeder.up();
  console.log("All seeders performed successfully");
}
