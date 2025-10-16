import connection_data from './database';
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

const pool = new Pool(connection_data);

(async () => {
  const client = await pool.connect();
  await client.query('SET search_path TO 13955');
  client.release();
})();

app.use(express.json());
app.use(cors())

app.get('/', async (req, res) => {
    res.json({
        status: "ok"
    });
});

app.get('/hello/:name', async (req, res) => {
    res.json({
        message: `Hello, ${req.params.name}`
    });
});

app.listen(8001)