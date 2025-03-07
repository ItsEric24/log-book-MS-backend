const {Pool} = require("pg")
require("dotenv").config()

const connection = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

module.exports = {
    query: (qstr, params) => connection.query(qstr, params)
}