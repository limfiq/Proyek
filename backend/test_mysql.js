require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USERNAME);
    console.log('DB:', process.env.DB_DATABASE);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        console.log('Connected successfully!');
        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

test();
