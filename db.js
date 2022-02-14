const { Client } = require('pg');

const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'valentine',
    password: 'DianaSun1801',
    port: 5432,
});

client.connect();

function DBquery(query) {
    client.query(query, (err, res) => {
        if(!err) {
            console.log(res.rows);
        }
    })
}

module.exports.DBquery = DBquery;

