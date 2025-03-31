import mysql from 'mysql';

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "openbar"
}

export const db = mysql.createConnection(dbConfig);
