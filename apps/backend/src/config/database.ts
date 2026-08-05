import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "lms_user",
  password: "lms_password",
  database: "lms_db",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
