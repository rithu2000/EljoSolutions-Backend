import { Sequelize } from 'sequelize';

// const sequelize = new Sequelize({
//     dialect: 'mysql',
//     host: '127.0.0.1',
//     username: 'root',
//     password: 'password',
//     database: 'eljoSolutions',
// });

const host = process.env.HOST;
const port = process.env.PORT;
const database = process.env.DATABASE;
const user = process.env.ADMIN;
const password = process.env.PASSWORD;

const sequelize = new Sequelize(database, user, password, {
  host: host,
  port: port,
  dialect: 'mysql',
  logging: false,
});

export default sequelize;